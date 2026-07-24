from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel


class TopologyEntity(CanonicalEntityModel):
    source_id: str = Field(default="")
    target_id: str = Field(default="")


class CanonicalTopology(TopologyEntity):
    entity_type: str = "canonical_topology"


class CanonicalLink(TopologyEntity):
    entity_type: str = "canonical_link"


class CanonicalNeighbor(TopologyEntity):
    entity_type: str = "canonical_neighbor"


class CanonicalRoute(TopologyEntity):
    entity_type: str = "canonical_route"


class CanonicalConnection(TopologyEntity):
    entity_type: str = "canonical_connection"


class CanonicalDependency(TopologyEntity):
    entity_type: str = "canonical_dependency"