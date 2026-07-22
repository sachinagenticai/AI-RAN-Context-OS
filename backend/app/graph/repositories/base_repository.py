from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseGraphRepository(ABC):
    """Abstract repository contract for graph persistence operations."""

    @abstractmethod
    def create_node(self, node: Any) -> None:
        """Persist a node to the graph."""

    @abstractmethod
    def create_relationship(self, relationship: Any) -> None:
        """Persist a relationship to the graph."""

    @abstractmethod
    def get_neighbors(self, node_id: str, relationship_type: str | None = None) -> list[Any]:
        """Return neighbors for an entity."""
