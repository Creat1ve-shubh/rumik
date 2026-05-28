"""
CMP Backend — FastAPI Application

Startup sequence:
    1. Load embedding model (bge-small)
    2. Initialize Cognitive Planner (pre-compute prototype embeddings)
    3. Connect to Neo4j, Qdrant, Redis
    4. Register API routes
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

# ─── Services (initialized at startup) ───
_services = {}


def get_services():
    return _services


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown lifecycle."""
    global _services
    logger = logging.getLogger("cmp")
    logger.setLevel(logging.INFO)

    # ── 1. Load embedding model ──
    logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
    from sentence_transformers import SentenceTransformer

    embedder = SentenceTransformer(settings.EMBEDDING_MODEL)
    _services["embedder"] = embedder
    logger.info("Embedding model loaded")

    # ── 2. Initialize Cognitive Planner ──
    from services.planner import CognitivePlanner

    planner = CognitivePlanner()
    await planner.initialize(embedder)
    _services["planner"] = planner
    logger.info("Cognitive Planner initialized")

    # ── 3. Connect to Neo4j ──
    from services.memory import GraphManager

    graph = GraphManager()
    try:
        await graph.connect()
        logger.info("Connected to Neo4j")
    except Exception as e:
        logger.warning(f"Neo4j not available: {e} — running in degraded mode")
    _services["graph"] = graph

    # ── 4. Connect to Qdrant ──
    from services.memory import RetrievalEngine

    retrieval = RetrievalEngine()
    try:
        await retrieval.connect()
        logger.info("Connected to Qdrant")
    except Exception as e:
        logger.warning(f"Qdrant not available: {e} — running in degraded mode")
    _services["retrieval"] = retrieval

    # ── 5. Ingestion pipeline ──
    from services.memory import IngestionPipeline

    _services["ingestion"] = IngestionPipeline()

    # ── 6. Explainability engine ──
    from services.explainability import ExplainabilityEngine

    _services["explainability"] = ExplainabilityEngine()

    # ── 7. Identity engine ──
    from services.identity import IdentityEngine

    _services["identity"] = IdentityEngine()

    # ── 8. Model Orchestrator ──
    from services.orchestrator import ModelOrchestrator

    _services["orchestrator"] = ModelOrchestrator()

    # ── 9. Redis Cache ──
    from services.cache import CacheManager
    
    cache = CacheManager()
    await cache.connect()
    _services["cache"] = cache

    logger.info("CMP Backend ready")
    yield

    # ── Shutdown ──
    await graph.close()
    await retrieval.close()
    await cache.close()
    logger.info("CMP Backend stopped")


# ─── App ───

app = FastAPI(
    title="Cognitive Memory Protocol",
    description="AI memory orchestration with cognitive query planning",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register routers ───
from api.chat import router as chat_router
from api.graph import router as graph_router
from api.metrics import router as metrics_router

app.include_router(chat_router)
app.include_router(graph_router)
app.include_router(metrics_router)
