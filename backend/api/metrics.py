"""
/metrics + /identity endpoints — observability and identity tracking.
"""

from fastapi import APIRouter
from schemas.models import MetricsResponse, IdentitySnapshot

router = APIRouter(prefix="/api", tags=["metrics"])


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """System health and performance metrics."""
    from main import get_services
    services = get_services()

    graph_stats = await services["graph"].get_stats()
    vector_stats = await services["retrieval"].get_collection_info()

    return MetricsResponse(
        total_memories=vector_stats.get("points_count", 0),
        total_entities=graph_stats.get("total_entities", 0),
        total_relationships=graph_stats.get("total_relationships", 0),
    )


@router.get("/identity", response_model=IdentitySnapshot)
async def get_identity(user_id: str = "default"):
    """
    Current identity snapshot.
    Phase 6: this will be computed by the Identity Engine
    from longitudinal memory analysis.
    """
    # Placeholder — returns defaults until Identity Engine is built
    return IdentitySnapshot()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "CMP Backend"}
