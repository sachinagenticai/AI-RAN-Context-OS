from __future__ import annotations

from typing import Any

from app.reasoning.models import (
    PredictionResult,
    ReasoningDecision,
    ReasoningRequest,
    ReasoningResponse,
    RecommendationAction,
    RootCauseCandidate,
)


class RootCauseEngine:
    """Analyze telecom signals and rank probable root causes."""

    def analyze(self, request: ReasoningRequest) -> list[RootCauseCandidate]:
        context = request.context or {}
        correlation = request.correlation or {}
        evidence = request.evidence or {}
        alarms = context.get("alarm_summary") or {}
        kpis = context.get("kpi_summary") or {}
        weather = context.get("weather_summary") or {}
        inventory = context.get("inventory_summary") or {}

        candidates: list[RootCauseCandidate] = []

        if alarms.get("severity") in {"Critical", "Major"}:
            candidates.append(RootCauseCandidate(cause="Severe alarm storm", confidence=0.9, evidence=["high severity alarms detected"]))
        if kpis.get("avg_rsrp") is not None and kpis.get("avg_rsrp") < -100:
            candidates.append(RootCauseCandidate(cause="Radio coverage degradation", confidence=0.85, evidence=["RSRP below threshold"]))
        if weather.get("condition") in {"Storm", "Cyclone", "Heavy Rain"}:
            candidates.append(RootCauseCandidate(cause="Weather-induced signal degradation", confidence=0.8, evidence=["adverse weather observed"]))
        if inventory.get("technology") == "5G" and correlation.get("score", 0.0) >= 0.5:
            candidates.append(RootCauseCandidate(cause="5G capacity pressure", confidence=0.75, evidence=["high correlation from operational signals"]))

        if not candidates:
            candidates.append(RootCauseCandidate(cause="No dominant root cause identified", confidence=0.5, evidence=["insufficient evidence"]))

        return sorted(candidates, key=lambda item: item.confidence, reverse=True)[:3]


class RecommendationEngine:
    """Generate deterministic remediation actions."""

    def generate(self, root_causes: list[RootCauseCandidate]) -> list[RecommendationAction]:
        actions: list[RecommendationAction] = []
        for cause in root_causes:
            if cause.cause == "Severe alarm storm":
                actions.append(RecommendationAction(action="Dispatch field engineering team", priority="P1", expected_improvement=0.8, rationale="Mitigate active alarms quickly"))
            elif cause.cause == "Radio coverage degradation":
                actions.append(RecommendationAction(action="Optimize radio parameters and check feeder health", priority="P2", expected_improvement=0.7, rationale="Improve coverage and signal quality"))
            elif cause.cause == "Weather-induced signal degradation":
                actions.append(RecommendationAction(action="Increase monitoring and rerate traffic", priority="P2", expected_improvement=0.6, rationale="Reduce risk during weather events"))
            else:
                actions.append(RecommendationAction(action="Continue monitoring", priority="P3", expected_improvement=0.3, rationale="Maintain observation until more evidence emerges"))
        return sorted(actions, key=lambda item: (item.priority != "P1", -item.expected_improvement), reverse=False)


class PredictionEngine:
    """Predict short-term network degradation and SLA risk."""

    def predict(self, request: ReasoningRequest) -> PredictionResult:
        correlation_score = float(request.correlation.get("score", 0.0))
        kpi_summary = request.context.get("kpi_summary") or {}
        avg_rsrp = kpi_summary.get("avg_rsrp")

        if correlation_score >= 0.7 or (avg_rsrp is not None and avg_rsrp < -110):
            degradation_risk = "High"
            kpi_trend = "Degrading"
            sla_violation_risk = "High"
            confidence = 0.9
        elif correlation_score >= 0.4 or (avg_rsrp is not None and avg_rsrp < -100):
            degradation_risk = "Medium"
            kpi_trend = "Stable with caution"
            sla_violation_risk = "Medium"
            confidence = 0.7
        else:
            degradation_risk = "Low"
            kpi_trend = "Stable"
            sla_violation_risk = "Low"
            confidence = 0.6

        return PredictionResult(
            degradation_risk=degradation_risk,
            kpi_trend=kpi_trend,
            sla_violation_risk=sla_violation_risk,
            confidence=confidence,
        )


class DecisionEngine:
    """Select the most appropriate action and business posture."""

    def decide(self, recommendation: list[RecommendationAction], prediction: PredictionResult, confidence: float) -> ReasoningDecision:
        primary = recommendation[0] if recommendation else RecommendationAction(action="Continue monitoring", priority="P3", expected_improvement=0.2, rationale="No strong action required")
        if primary.priority == "P1" or prediction.degradation_risk == "High":
            business_priority = "P1"
            estimated_benefit = 0.9
            estimated_risk = 0.2
        elif primary.priority == "P2" or prediction.degradation_risk == "Medium":
            business_priority = "P2"
            estimated_benefit = 0.7
            estimated_risk = 0.4
        else:
            business_priority = "P3"
            estimated_benefit = 0.4
            estimated_risk = 0.6

        return ReasoningDecision(
            recommended_action=primary.action,
            confidence=confidence,
            business_priority=business_priority,
            estimated_benefit=estimated_benefit,
            estimated_risk=estimated_risk,
            rollback_plan="Revert to previous configuration and monitor stability",
        )


class ConfidenceEngine:
    """Aggregate confidence from multiple reasoning inputs."""

    def aggregate(self, *, context: dict[str, Any], correlation: dict[str, Any], evidence: dict[str, Any], root_causes: list[RootCauseCandidate], prediction: PredictionResult) -> float:
        context_score = 0.8 if context.get("inventory_summary") or context.get("kpi_summary") else 0.5
        correlation_score = float(correlation.get("score", 0.0))
        evidence_score = float(evidence.get("confidence", 0.0))
        root_cause_score = max((candidate.confidence for candidate in root_causes), default=0.0)
        prediction_score = prediction.confidence

        aggregate = (context_score + correlation_score + evidence_score + root_cause_score + prediction_score) / 5.0
        return round(min(1.0, max(0.0, aggregate)), 2)


class PolicyValidator:
    """Validate recommendations against policy guardrails."""

    def validate(self, recommendations: list[RecommendationAction], decision: ReasoningDecision) -> list[RecommendationAction]:
        allowed: list[RecommendationAction] = []
        for recommendation in recommendations:
            if recommendation.priority == "P1" and decision.estimated_risk > 0.5:
                continue
            if recommendation.action.lower().startswith("dispatch") and decision.estimated_risk > 0.5:
                continue
            allowed.append(recommendation)
        return allowed


class ReasoningEngine:
    """Facade for the full reasoning workflow."""

    def __init__(self) -> None:
        self.root_cause_engine = RootCauseEngine()
        self.recommendation_engine = RecommendationEngine()
        self.prediction_engine = PredictionEngine()
        self.decision_engine = DecisionEngine()
        self.confidence_engine = ConfidenceEngine()
        self.policy_validator = PolicyValidator()

    def reason(self, request: ReasoningRequest) -> ReasoningResponse:
        root_causes = self.root_cause_engine.analyze(request)
        recommendations = self.recommendation_engine.generate(root_causes)
        prediction = self.prediction_engine.predict(request)
        confidence = self.confidence_engine.aggregate(
            context=request.context,
            correlation=request.correlation,
            evidence=request.evidence,
            root_causes=root_causes,
            prediction=prediction,
        )
        decision = self.decision_engine.decide(recommendations, prediction, confidence)
        validated_recommendations = self.policy_validator.validate(recommendations, decision)
        if validated_recommendations:
            decision.recommended_action = validated_recommendations[0].action
        return ReasoningResponse(
            entity_id=request.entity_id,
            entity_type=request.entity_type,
            root_causes=root_causes,
            recommendations=validated_recommendations or recommendations,
            prediction=prediction,
            decision=decision,
            confidence=confidence,
        )
