from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel
from app.models.enums.common import ApprovalStatus


class GovernanceEntity(CanonicalEntityModel):
    decision: str = Field(default="")
    approval_status: ApprovalStatus = ApprovalStatus.PENDING


class CanonicalPolicyDecision(GovernanceEntity):
    entity_type: str = "canonical_policy_decision"


class CanonicalApproval(GovernanceEntity):
    entity_type: str = "canonical_approval"
    approval_status: ApprovalStatus = ApprovalStatus.APPROVED


class CanonicalAudit(GovernanceEntity):
    entity_type: str = "canonical_audit"


class CanonicalCompliance(GovernanceEntity):
    entity_type: str = "canonical_compliance"


class CanonicalViolation(GovernanceEntity):
    entity_type: str = "canonical_violation"