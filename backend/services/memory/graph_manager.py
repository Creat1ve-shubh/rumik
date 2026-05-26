"""
Neo4j Graph Manager — CRUD for the memory graph.
Source of truth for entities, relationships, and structure.

Falls back to an in-memory store when Neo4j is unavailable.
"""

import logging
from typing import List, Dict, Any, Optional
from config import settings
from schemas.models import Entity, Relationship

logger = logging.getLogger("cmp.graph")


class GraphManager:
    """Manages the Neo4j memory graph — nodes, edges, queries."""

    def __init__(self):
        self._driver = None
        self._connected = False
        # In-memory fallback
        self._mem_nodes: Dict[str, Dict[str, Any]] = {}
        self._mem_edges: List[Dict[str, Any]] = []

    @property
    def is_connected(self) -> bool:
        return self._connected

    async def connect(self) -> None:
        try:
            from neo4j import AsyncGraphDatabase
            self._driver = AsyncGraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            )
            async with self._driver.session() as session:
                await session.run(
                    "CREATE INDEX IF NOT EXISTS FOR (n:Entity) ON (n.id)"
                )
                await session.run(
                    "CREATE INDEX IF NOT EXISTS FOR (n:Entity) ON (n.name)"
                )
                await session.run(
                    "CREATE INDEX IF NOT EXISTS FOR (n:Entity) ON (n.type)"
                )
            self._connected = True
            logger.info("Connected to Neo4j")
        except Exception as e:
            logger.warning(f"Neo4j not available: {e} — using in-memory graph")
            self._connected = False

    async def close(self) -> None:
        if self._driver:
            await self._driver.close()

    # ─── Node Operations ───

    async def create_entity(self, entity: Entity) -> Entity:
        if not self._connected:
            self._mem_nodes[entity.id] = {
                "id": entity.id,
                "name": entity.name,
                "type": entity.type.value,
                "importance": entity.importance,
                "confidence": entity.confidence,
            }
            return entity

        query = """
        MERGE (e:Entity {name: $name, type: $type})
        ON CREATE SET
            e.id = $id,
            e.importance = $importance,
            e.confidence = $confidence,
            e.metadata = $metadata,
            e.created_at = datetime(),
            e.updated_at = datetime()
        ON MATCH SET
            e.importance = CASE WHEN $importance > e.importance
                           THEN $importance ELSE e.importance END,
            e.confidence = $confidence,
            e.updated_at = datetime()
        RETURN e
        """
        async with self._driver.session() as session:
            result = await session.run(
                query,
                id=entity.id,
                name=entity.name,
                type=entity.type.value,
                importance=entity.importance,
                confidence=entity.confidence,
                metadata=str(entity.metadata),
            )
            await result.consume()
        return entity

    async def create_relationship(self, rel: Relationship) -> Relationship:
        if not self._connected:
            self._mem_edges.append({
                "id": rel.id,
                "source": rel.source_id,
                "target": rel.target_id,
                "type": rel.type.value,
                "strength": rel.strength,
            })
            return rel

        query = """
        MATCH (a:Entity {id: $source_id})
        MATCH (b:Entity {id: $target_id})
        MERGE (a)-[r:RELATES {type: $rel_type}]->(b)
        ON CREATE SET
            r.id = $id,
            r.strength = $strength,
            r.created_at = datetime()
        ON MATCH SET
            r.strength = CASE WHEN $strength > r.strength
                         THEN $strength ELSE r.strength END
        RETURN r
        """
        async with self._driver.session() as session:
            result = await session.run(
                query,
                id=rel.id,
                source_id=rel.source_id,
                target_id=rel.target_id,
                rel_type=rel.type.value,
                strength=rel.strength,
            )
            await result.consume()
        return rel

    # ─── Queries ───

    async def get_user_graph(self, user_id: str = "default") -> Dict[str, Any]:
        """Return all nodes and edges for a user."""
        if not self._connected:
            nodes = list(self._mem_nodes.values())
            return {
                "nodes": nodes,
                "edges": self._mem_edges,
                "stats": {"total_nodes": len(nodes), "total_edges": len(self._mem_edges)},
            }

        query = """
        MATCH (e:Entity)
        OPTIONAL MATCH (e)-[r:RELATES]->(t:Entity)
        RETURN e, r, t
        """
        nodes = []
        edges = []
        seen_nodes = set()

        async with self._driver.session() as session:
            result = await session.run(query)
            async for record in result:
                node = record["e"]
                if node["id"] not in seen_nodes:
                    nodes.append(dict(node))
                    seen_nodes.add(node["id"])

                if record["r"] and record["t"]:
                    target = record["t"]
                    if target["id"] not in seen_nodes:
                        nodes.append(dict(target))
                        seen_nodes.add(target["id"])
                    edges.append({
                        "id": record["r"].get("id", ""),
                        "source": node["id"],
                        "target": target["id"],
                        "type": record["r"].get("type", "RELATES"),
                        "strength": record["r"].get("strength", 0.5),
                    })

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {"total_nodes": len(nodes), "total_edges": len(edges)},
        }

    async def get_neighbors(
        self, entity_id: str, depth: int = 2, max_nodes: int = 50
    ) -> Dict[str, Any]:
        """BFS expansion from a node up to `depth` hops."""
        if not self._connected:
            return {"nodes": []}

        query = """
        MATCH path = (start:Entity {id: $entity_id})-[r:RELATES*1..$depth]-(neighbor:Entity)
        WITH neighbor, r, length(path) as dist
        ORDER BY dist
        LIMIT $max_nodes
        RETURN DISTINCT neighbor, dist
        """
        nodes = []
        async with self._driver.session() as session:
            result = await session.run(
                query,
                entity_id=entity_id,
                depth=depth,
                max_nodes=max_nodes,
            )
            async for record in result:
                nodes.append({**dict(record["neighbor"]), "distance": record["dist"]})
        return {"nodes": nodes}

    async def search_entities(
        self, entity_type: Optional[str] = None, name_contains: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Filter entities by type and/or name substring."""
        if not self._connected:
            results = list(self._mem_nodes.values())
            if entity_type:
                results = [n for n in results if n.get("type") == entity_type]
            if name_contains:
                lc = name_contains.lower()
                results = [n for n in results if lc in n.get("name", "").lower()]
            return results

        conditions = []
        params: Dict[str, Any] = {}

        if entity_type:
            conditions.append("e.type = $type")
            params["type"] = entity_type
        if name_contains:
            conditions.append("toLower(e.name) CONTAINS toLower($name)")
            params["name"] = name_contains

        where_clause = " AND ".join(conditions) if conditions else "TRUE"
        query = f"MATCH (e:Entity) WHERE {where_clause} RETURN e LIMIT 100"

        entities = []
        async with self._driver.session() as session:
            result = await session.run(query, **params)
            async for record in result:
                entities.append(dict(record["e"]))
        return entities

    async def get_stats(self) -> Dict[str, int]:
        if not self._connected:
            return {
                "total_entities": len(self._mem_nodes),
                "total_relationships": len(self._mem_edges),
            }

        async with self._driver.session() as session:
            nodes_result = await session.run("MATCH (n:Entity) RETURN count(n) as c")
            node_count = (await nodes_result.single())["c"]
            edges_result = await session.run("MATCH ()-[r:RELATES]->() RETURN count(r) as c")
            edge_count = (await edges_result.single())["c"]
        return {"total_entities": node_count, "total_relationships": edge_count}
