from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ApprovalLevel(str, Enum):
    AUTO_APPROVE = "AUTO_APPROVE"
    SUPERVISOR = "SUPERVISOR"
    ENGINEER = "ENGINEER"
    MANAGER = "MANAGER"
    EXECUTIVE = "EXECUTIVE"


class PolicyCategory(str, Enum):
    OPERATIONAL = "Operational"
    SAFETY = "Safety"
    BUSINESS = "Business"
    MAINTENANCE = "Maintenance"
    SLA = "SLA"
    SECURITY = "Security"
    COMPLIANCE = "Compliance"
    COST_OPTIMIZATION = "Cost Optimization"


class Policy(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    version: str = Field(min_length=1)
    description: str = Field(default="")
    category: PolicyCategory
    enabled: bool = True
    rules: list["PolicyRule"] = Field(default_factory=list)


class PolicyRule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    category: PolicyCategory
    description: str = Field(default="")
    severity: str = Field(default="medium")
    condition: str = Field(min_length=1)
    action: str = Field(default="allow")
    approval_level: ApprovalLevel = ApprovalLevel.AUTO_APPROVE
    risk_threshold: float = Field(default=0.5, ge=0.0, le=1.0)


class PolicyViolation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rule_id: str
    rule_name: str
    category: PolicyCategory
    severity: str
    message: str


class PolicyResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    reason: str
    matched_rules: list[str] = Field(default_factory=list)
    violations: list[PolicyViolation] = Field(default_factory=list)
    risk_score: float = Field(ge=0.0, le=1.0)
    approval_level: ApprovalLevel
    request_id: str
    policy_version: str
    timestamp: str
    evaluation_time: float = Field(ge=0.0)


class PolicyVersion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str
    policies: list[Policy] = Field(default_factory=list)


class ApprovalDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    approved: bool
    approval_level: ApprovalLevel
    reason: str
