from __future__ import annotations

from typing import Any

from app.graph.models.telecom_graph import GraphNode, GraphRelationship
from app.graph.repositories.base_repository import BaseGraphRepository


class TelecomGraphRepository(BaseGraphRepository):
    """In-memory repository used to model Neo4j-like graph operations."""

    def __init__(self) -> None:
        self._nodes: dict[str, GraphNode] = {}
        self._relationships: list[GraphRelationship] = []

    def create_node(self, node: GraphNode) -> None:
        self._nodes[node.id] = node

    def create_relationship(self, relationship: GraphRelationship) -> None:
        self._relationships.append(relationship)

    def get_neighbors(self, node_id: str, relationship_type: str | None = None) -> list[GraphNode]:
        neighbors: list[GraphNode] = []
        for relationship in self._relationships:
            if relationship.source != node_id and relationship.target != node_id:
                continue
            if relationship_type and relationship.type != relationship_type:
                continue
            other_id = relationship.target if relationship.source == node_id else relationship.source
            if other_id in self._nodes:
                neighbors.append(self._nodes[other_id])
        return neighbors

    def list_nodes(self) -> list[GraphNode]:
        return list(self._nodes.values())

    def list_relationships(self) -> list[GraphRelationship]:
        return list(self._relationships)
