from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel
from app.models.enums.common import RiskLevel


class BusinessEntity(CanonicalEntityModel):
    amount: float = Field(default=0.0)
    currency: str = Field(default="USD")
    risk_level: RiskLevel = RiskLevel.LOW


class CanonicalBusinessImpact(BusinessEntity):
    entity_type: str = "canonical_business_impact"


class CanonicalROI(BusinessEntity):
    entity_type: str = "canonical_roi"


class CanonicalCost(BusinessEntity):
    entity_type: str = "canonical_cost"


class CanonicalRisk(BusinessEntity):
    entity_type: str = "canonical_risk"
    risk_level: RiskLevel = RiskLevel.MEDIUM


class CanonicalPriority(BusinessEntity):
    entity_type: str = "canonical_priority"


class CanonicalSLA(BusinessEntity):
    entity_type: str = "canonical_sla"


class CanonicalCustomerImpact(BusinessEntity):
    entity_type: str = "canonical_customer_impact"