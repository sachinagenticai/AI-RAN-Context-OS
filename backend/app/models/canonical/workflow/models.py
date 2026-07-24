from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel
from app.models.enums.common import WorkflowStatus


class WorkflowEntity(CanonicalEntityModel):
    workflow_status: WorkflowStatus = WorkflowStatus.CREATED
    step_count: int = Field(default=0, ge=0)


class CanonicalTask(WorkflowEntity):
    entity_type: str = "canonical_task"


class CanonicalWorkflow(WorkflowEntity):
    entity_type: str = "canonical_workflow"


class CanonicalExecution(WorkflowEntity):
    entity_type: str = "canonical_execution"


class CanonicalPipeline(WorkflowEntity):
    entity_type: str = "canonical_pipeline"