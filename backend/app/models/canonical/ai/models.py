from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel


class AIEntity(CanonicalEntityModel):
    narrative: str = Field(default="")
    payload: dict[str, object] = Field(default_factory=dict)


class CanonicalContext(AIEntity):
    entity_type: str = "canonical_context"


class CanonicalEvidence(AIEntity):
    entity_type: str = "canonical_evidence"


class CanonicalReasoning(AIEntity):
    entity_type: str = "canonical_reasoning"


class CanonicalDecision(AIEntity):
    entity_type: str = "canonical_decision"


class CanonicalRecommendation(AIEntity):
    entity_type: str = "canonical_recommendation"


class CanonicalPrediction(AIEntity):
    entity_type: str = "canonical_prediction"


class CanonicalConfidence(AIEntity):
    entity_type: str = "canonical_confidence"


class CanonicalExplanation(AIEntity):
    entity_type: str = "canonical_explanation"