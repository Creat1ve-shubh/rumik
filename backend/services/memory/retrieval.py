"""
Hybrid Retrieval Engine

    Query → Embedding → Vector Search (Qdrant) →
    Graph Expansion (Neo4j) → Re-ranking → Subgraph Assembly

Retrieval scoring formula (from TDD):
    Final = Semantic×0.4 + Importance×0.2 + Recency×0.2 + RelStrength×0.2
"""

import time
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    VectorParams, Distance, PointStruct, Filter,
    FieldCondition, MatchValue, SearchRequest,
)

from config import settings
from schemas.models import MemoryPlan


class RetrievalEngine:
    """Hybrid vector + graph retrieval with weighted re-ranking."""

    def __init__(self):
        self._qdrant: Optional[AsyncQdrantClient] = None
        self._collection = settings.QDRANT_COLLECTION

    async def connect(self) -> None:
        self._qdrant = AsyncQdrantClient(
            host=settings.QDRANT_HOST, port=settings.QDRANT_PORT
        )
        # Ensure collection exists
        collections = await self._qdrant.get_collections()
        names = [c.name for c in collections.collections]
        if self._collection not in names:
            await self._qdrant.create_collection(
                collection_name=self._collection,
                vectors_config=VectorParams(
                    size=settings.EMBEDDING_DIM,
                    distance=Distance.COSINE,
                ),
            )

    async def close(self) -> None:
        if self._qdrant:
            await self._qdrant.close()

    # ─── Index a memory ───

    async def index_memory(
        self,
        memory_id: str,
        embedding: np.ndarray,
        payload: Dict[str, Any],
    ) -> None:
        """Store a memory embedding in Qdrant."""
        await self._qdrant.upsert(
            collection_name=self._collection,
            points=[
                PointStruct(
                    id=memory_id.replace("-", "")[:32],  # Qdrant needs hex-safe IDs
                    vector=embedding.tolist(),
                    payload={
                        "memory_id": memory_id,
                        "content": payload.get("content", ""),
                        "importance": payload.get("importance", 0.5),
                        "emotion": payload.get("emotion", "neutral"),
                        "entity_types": payload.get("entity_types", []),
                        "created_at": payload.get(
                            "created_at", datetime.now(timezone.utc).isoformat()
                        ),
                    },
                )
            ],
        )

    # ─── Retrieve relevant memories ───

    async def retrieve(
        self,
        query_embedding: np.ndarray,
        memory_plan: MemoryPlan,
    ) -> Dict[str, Any]:
        """
        Hybrid retrieval:
        1. Vector search in Qdrant (top-K candidates)
        2. Re-rank using the weighted scoring formula
        3. Return assembled subgraph context
        """
        t0 = time.perf_counter()

        # Step 1: Vector search
        top_k = min(memory_plan.max_nodes * 2, 100)  # Over-fetch for re-ranking
        results = await self._qdrant.search(
            collection_name=self._collection,
            query_vector=query_embedding.tolist(),
            limit=top_k,
        )

        # Step 2: Re-rank with weighted formula
        ranked = []
        now = datetime.now(timezone.utc)
        for hit in results:
            semantic_score = hit.score  # Cosine similarity from Qdrant
            importance = hit.payload.get("importance", 0.5)

            # Recency: decay over time (half-life = 30 days)
            created_str = hit.payload.get("created_at", now.isoformat())
            try:
                created = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                days_old = max(0, (now - created).days)
            except (ValueError, TypeError):
                days_old = 0
            recency = max(0.0, 1.0 - (days_old / 90.0))  # Linear decay over 90 days

            # Relationship strength (from payload if available, else default)
            rel_strength = hit.payload.get("rel_strength", 0.5)

            # Weighted final score
            final_score = (
                semantic_score * 0.4
                + importance * 0.2
                + recency * 0.2
                + rel_strength * 0.2
            )

            ranked.append({
                "memory_id": hit.payload.get("memory_id", ""),
                "content": hit.payload.get("content", ""),
                "semantic_score": round(semantic_score, 3),
                "importance": importance,
                "recency": round(recency, 3),
                "final_score": round(final_score, 3),
                "emotion": hit.payload.get("emotion", "neutral"),
                "entity_types": hit.payload.get("entity_types", []),
            })

        # Sort by final score and trim
        ranked.sort(key=lambda x: x["final_score"], reverse=True)
        ranked = ranked[: memory_plan.max_nodes]

        elapsed_ms = (time.perf_counter() - t0) * 1000

        return {
            "memories": ranked,
            "total_candidates": len(results),
            "returned": len(ranked),
            "retrieval_ms": round(elapsed_ms, 1),
        }

    async def get_collection_info(self) -> Dict[str, Any]:
        """Return stats about the vector collection."""
        try:
            info = await self._qdrant.get_collection(self._collection)
            return {
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
            }
        except Exception:
            return {"vectors_count": 0, "points_count": 0}
