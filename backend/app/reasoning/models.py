from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RootCauseCandidate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cause: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: list[str] = Field(default_factory=list)


class RecommendationAction(BaseModel):
    model_config = ConfigDict(extra="forbid")

    action: str
    priority: str
    expected_improvement: float = Field(ge=0.0, le=1.0)
    rationale: str


class PredictionResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    degradation_risk: str
    kpi_trend: str
    sla_violation_risk: str
    confidence: float = Field(ge=0.0, le=1.0)


class ReasoningDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recommended_action: str
    confidence: float = Field(ge=0.0, le=1.0)
    business_priority: str
    estimated_benefit: float = Field(ge=0.0, le=1.0)
    estimated_risk: float = Field(ge=0.0, le=1.0)
    rollback_plan: str


class ReasoningRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str = Field(min_length=1)
    entity_type: str = Field(min_length=1)
    context: dict[str, Any] = Field(default_factory=dict)
    correlation: dict[str, Any] = Field(default_factory=dict)
    evidence: dict[str, Any] = Field(default_factory=dict)
    business_impact: dict[str, Any] = Field(default_factory=dict)
    timeline: dict[str, Any] = Field(default_factory=dict)
    quality: dict[str, Any] = Field(default_factory=dict)


class ReasoningResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str
    entity_type: str
    root_causes: list[RootCauseCandidate]
    recommendations: list[RecommendationAction]
    prediction: PredictionResult
    decision: ReasoningDecision
    confidence: float = Field(ge=0.0, le=1.0)
