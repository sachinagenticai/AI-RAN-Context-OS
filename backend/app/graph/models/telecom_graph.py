from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class GraphNode:
    """A lightweight representation of a Neo4j graph node."""

    id: str
    labels: tuple[str, ...]
    properties: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class GraphRelationship:
    """A lightweight representation of a Neo4j relationship."""

    source: str
    target: str
    type: str
    properties: dict[str, Any] = field(default_factory=dict)
