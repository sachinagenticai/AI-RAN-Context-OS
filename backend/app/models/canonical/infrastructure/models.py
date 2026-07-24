from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel
from app.models.enums.common import NodeState


class InfrastructureEntity(CanonicalEntityModel):
    name: str = Field(default="", min_length=0)
    location: str = Field(default="unknown")
    node_state: NodeState = NodeState.ACTIVE


class CanonicalNode(InfrastructureEntity):
    entity_type: str = "canonical_node"


class CanonicalCell(InfrastructureEntity):
    entity_type: str = "canonical_cell"


class CanonicalSector(InfrastructureEntity):
    entity_type: str = "canonical_sector"


class CanonicalSite(InfrastructureEntity):
    entity_type: str = "canonical_site"


class CanonicalRegion(InfrastructureEntity):
    entity_type: str = "canonical_region"


class CanonicalCluster(InfrastructureEntity):
    entity_type: str = "canonical_cluster"


class CanonicalDataCenter(InfrastructureEntity):
    entity_type: str = "canonical_data_center"


class CanonicalRack(InfrastructureEntity):
    entity_type: str = "canonical_rack"


class CanonicalNetworkFunction(InfrastructureEntity):
    entity_type: str = "canonical_network_function"


class CanonicalEdge(InfrastructureEntity):
    entity_type: str = "canonical_edge"


class CanonicalCloudRegion(InfrastructureEntity):
    entity_type: str = "canonical_cloud_region"