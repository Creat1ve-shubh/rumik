"""
/metrics + /identity endpoints — observability and identity tracking.
"""

from fastapi import APIRouter, Response
from schemas.models import MetricsResponse, IdentitySnapshot

router = APIRouter(prefix="/api", tags=["metrics"])
# Mock prometheus to prevent Windows DNS hang during import
class MockMetric:
    def labels(self, *args, **kwargs): return self
    def observe(self, *args, **kwargs): pass
    def inc(self, *args, **kwargs): pass

LATENCY_HISTOGRAM = MockMetric()
LLM_ESCALATION_COUNTER = MockMetric()

@router.get("/prometheus")
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(
        content="Prometheus disabled locally to prevent Windows DNS hang.",
        media_type="text/plain"
    )


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
    Current identity snapshot computed by the Identity Engine
    from longitudinal memory analysis.
    """
    from main import get_services
    services = get_services()
    
    graph_data = await services["graph"].get_user_graph(user_id)
    snapshot = services["identity"].compute_snapshot(graph_data["nodes"], graph_data["edges"])
    
    return snapshot


@router.get("/health")
async def health():
    return {"status": "ok", "service": "CMP Backend"}
