"""
/graph endpoints — memory graph exploration.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.models import GraphResponse

router = APIRouter(prefix="/api", tags=["graph"])


@router.get("/graph", response_model=GraphResponse)
async def get_graph(user_id: str = "default"):
    """Return the full memory graph for a user."""
    from main import get_services
    services = get_services()

    data = await services["graph"].get_user_graph(user_id)
    return GraphResponse(
        nodes=data["nodes"],
        edges=data["edges"],
        stats=data["stats"],
    )


@router.get("/graph/neighbors")
async def get_neighbors(
    entity_id: str,
    depth: int = Query(default=2, ge=1, le=5),
    max_nodes: int = Query(default=50, ge=1, le=200),
):
    """BFS expansion from a specific entity."""
    from main import get_services
    services = get_services()

    return await services["graph"].get_neighbors(entity_id, depth, max_nodes)


@router.get("/graph/search")
async def search_entities(
    entity_type: Optional[str] = None,
    name: Optional[str] = None,
):
    """Search entities by type and/or name."""
    from main import get_services
    services = get_services()

    return await services["graph"].search_entities(entity_type, name)
