from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel
from app.models.enums.common import IncidentStatus


class OperationsEntity(CanonicalEntityModel):
    summary: str = Field(default="")
    assignee: str | None = None
    incident_status: IncidentStatus = IncidentStatus.OPEN


class CanonicalIncident(OperationsEntity):
    entity_type: str = "canonical_incident"


class CanonicalTicket(OperationsEntity):
    entity_type: str = "canonical_ticket"


class CanonicalWorkOrder(OperationsEntity):
    entity_type: str = "canonical_work_order"


class CanonicalMaintenance(OperationsEntity):
    entity_type: str = "canonical_maintenance"


class CanonicalChangeRequest(OperationsEntity):
    entity_type: str = "canonical_change_request"


class CanonicalProblem(OperationsEntity):
    entity_type: str = "canonical_problem"


class CanonicalServiceRequest(OperationsEntity):
    entity_type: str = "canonical_service_request"