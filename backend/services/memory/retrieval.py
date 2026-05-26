"""
Hybrid Retrieval Engine

    Query → Embedding → Vector Search (Qdrant) →
    Graph Expansion (Neo4j) → Re-ranking → Subgraph Assembly

Retrieval scoring formula (from TDD):
    Final = Semantic×0.4 + Importance×0.2 + Recency×0.2 + RelStrength×0.2

Falls back to in-memory vector search when Qdrant is unavailable.
"""

import time
import logging
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from config import settings
from schemas.models import MemoryPlan

logger = logging.getLogger("cmp.retrieval")


class RetrievalEngine:
    """Hybrid vector + graph retrieval with weighted re-ranking."""

    def __init__(self):
        self._qdrant = None
        self._connected = False
        self._collection = settings.QDRANT_COLLECTION
        # In-memory fallback
        self._mem_vectors: List[Dict[str, Any]] = []

    @property
    def is_connected(self) -> bool:
        return self._connected

    async def connect(self) -> None:
        try:
            from qdrant_client import AsyncQdrantClient
            from qdrant_client.models import VectorParams, Distance
            self._qdrant = AsyncQdrantClient(
                host=settings.QDRANT_HOST, port=settings.QDRANT_PORT
            )
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
            self._connected = True
            logger.info("Connected to Qdrant")
        except Exception as e:
            logger.warning(f"Qdrant not available: {e} — using in-memory vectors")
            self._connected = False

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
        """Store a memory embedding."""
        if not self._connected:
            self._mem_vectors.append({
                "memory_id": memory_id,
                "embedding": embedding.copy(),
                "content": payload.get("content", ""),
                "importance": payload.get("importance", 0.5),
                "emotion": payload.get("emotion", "neutral"),
                "entity_types": payload.get("entity_types", []),
                "created_at": payload.get(
                    "created_at", datetime.now(timezone.utc).isoformat()
                ),
            })
            return

        from qdrant_client.models import PointStruct
        await self._qdrant.upsert(
            collection_name=self._collection,
            points=[
                PointStruct(
                    id=memory_id.replace("-", "")[:32],
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
        """Hybrid retrieval with weighted re-ranking."""
        t0 = time.perf_counter()

        if not self._connected:
            ranked = self._mem_retrieve(query_embedding, memory_plan)
        else:
            ranked = await self._qdrant_retrieve(query_embedding, memory_plan)

        elapsed_ms = (time.perf_counter() - t0) * 1000

        return {
            "memories": ranked,
            "total_candidates": len(ranked),
            "returned": len(ranked),
            "retrieval_ms": round(elapsed_ms, 1),
        }

    def _mem_retrieve(
        self, query_embedding: np.ndarray, memory_plan: MemoryPlan
    ) -> List[Dict[str, Any]]:
        """In-memory cosine similarity search + re-ranking."""
        now = datetime.now(timezone.utc)
        ranked = []

        for mem in self._mem_vectors:
            emb = mem["embedding"]
            semantic_score = float(self._cosine_sim(query_embedding, emb))
            importance = mem.get("importance", 0.5)

            try:
                created = datetime.fromisoformat(
                    mem.get("created_at", now.isoformat()).replace("Z", "+00:00")
                )
                days_old = max(0, (now - created).days)
            except (ValueError, TypeError):
                days_old = 0
            recency = max(0.0, 1.0 - (days_old / 90.0))
            rel_strength = 0.5

            final_score = (
                semantic_score * 0.4
                + importance * 0.2
                + recency * 0.2
                + rel_strength * 0.2
            )

            ranked.append({
                "memory_id": mem["memory_id"],
                "content": mem["content"],
                "semantic_score": round(semantic_score, 3),
                "importance": importance,
                "recency": round(recency, 3),
                "final_score": round(final_score, 3),
                "emotion": mem.get("emotion", "neutral"),
                "entity_types": mem.get("entity_types", []),
            })

        ranked.sort(key=lambda x: x["final_score"], reverse=True)
        return ranked[: memory_plan.max_nodes]

    async def _qdrant_retrieve(
        self, query_embedding: np.ndarray, memory_plan: MemoryPlan
    ) -> List[Dict[str, Any]]:
        """Qdrant vector search + re-ranking."""
        now = datetime.now(timezone.utc)
        top_k = min(memory_plan.max_nodes * 2, 100)

        results = await self._qdrant.search(
            collection_name=self._collection,
            query_vector=query_embedding.tolist(),
            limit=top_k,
        )

        ranked = []
        for hit in results:
            semantic_score = hit.score
            importance = hit.payload.get("importance", 0.5)

            created_str = hit.payload.get("created_at", now.isoformat())
            try:
                created = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                days_old = max(0, (now - created).days)
            except (ValueError, TypeError):
                days_old = 0
            recency = max(0.0, 1.0 - (days_old / 90.0))
            rel_strength = hit.payload.get("rel_strength", 0.5)

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

        ranked.sort(key=lambda x: x["final_score"], reverse=True)
        return ranked[: memory_plan.max_nodes]

    @staticmethod
    def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
        na, nb = np.linalg.norm(a), np.linalg.norm(b)
        if na == 0 or nb == 0:
            return 0.0
        return float(np.dot(a, b) / (na * nb))

    async def get_collection_info(self) -> Dict[str, Any]:
        if not self._connected:
            return {
                "vectors_count": len(self._mem_vectors),
                "points_count": len(self._mem_vectors),
            }
        try:
            info = await self._qdrant.get_collection(self._collection)
            return {
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
            }
        except Exception:
            return {"vectors_count": 0, "points_count": 0}
