from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from app.synthetic_data.models.context.context import ContextObject


@dataclass(slots=True)
class CorrelationResult:
    score: float
    explanation: str
    evidence: list[str]


class ContextCorrelationEngine:
    """Correlate operational signals into a single contextual explanation."""

    def correlate(
        self,
        *,
        inventory: dict[str, Any],
        kpis: dict[str, Any],
        alarms: dict[str, Any],
        weather: dict[str, Any],
        maintenance: dict[str, Any] | None = None,
        traffic: dict[str, Any] | None = None,
        topology: dict[str, Any] | None = None,
        neighbor_cells: list[str] | None = None,
        configuration: dict[str, Any] | None = None,
    ) -> CorrelationResult:
        score = 0.0
        evidence: list[str] = []

        if kpis.get("avg_rsrp") is not None and kpis.get("avg_rsrp") < -100:
            score += 0.3
            evidence.append("Poor RSRP suggests degraded radio conditions")
        if alarms.get("severity") in {"Critical", "Major"}:
            score += 0.3
            evidence.append("High-severity alarms indicate service impact")
        if weather.get("condition") in {"Storm", "Cyclone", "Heavy Rain"}:
            score += 0.2
            evidence.append("Adverse weather may amplify performance degradation")
        if maintenance and maintenance.get("status") in {"In Progress", "Planned"}:
            score += 0.1
            evidence.append("Maintenance activity is affecting service readiness")
        if topology and topology.get("neighbor_cells"):
            score += 0.1
            evidence.append("Topology indicates neighboring cells may be involved")

        explanation = "Operational context appears degraded" if score >= 0.5 else "Operational context is stable with moderate risk"
        return CorrelationResult(score=min(score, 1.0), explanation=explanation, evidence=evidence)


class ContextEvidenceEngine:
    """Provide evidence-backed narrative for an operational context."""

    def build_evidence(self, *, context: ContextObject, correlation: CorrelationResult) -> dict[str, Any]:
        return {
            "why": correlation.explanation,
            "how": "The engine combined KPI, alarm, weather, maintenance, and topology signals into a weighted assessment",
            "evidence": correlation.evidence or ["No specific evidence was identified"],
            "confidence": round(min(0.95, 0.5 + correlation.score), 2),
            "affected_objects": [context.entity_id],
            "timeline": [datetime.now(timezone.utc).isoformat()],
        }


class BusinessImpactEngine:
    """Estimate business impact from the derived context."""

    def estimate(self, *, correlation: CorrelationResult, subscribers: int = 5000, revenue_per_sub: float = 5.0) -> dict[str, Any]:
        impact_score = correlation.score
        return {
            "subscribers_affected": int(subscribers * impact_score),
            "revenue_impact": round(subscribers * revenue_per_sub * impact_score, 2),
            "sla_impact": "High" if impact_score >= 0.7 else "Medium" if impact_score >= 0.4 else "Low",
            "coverage_impact": "Severe" if impact_score >= 0.8 else "Moderate" if impact_score >= 0.5 else "Limited",
            "risk": "High" if impact_score >= 0.7 else "Medium" if impact_score >= 0.4 else "Low",
            "priority": "P1" if impact_score >= 0.7 else "P2" if impact_score >= 0.4 else "P3",
        }


class ContextTimelineEngine:
    """Generate historical, current, and future context snapshots."""

    def build_timeline(self, *, entity_id: str, entity_type: str) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        return {
            "historical": [{"timestamp": (now - timedelta(hours=6)).isoformat(), "state": "stable"}],
            "current": {"timestamp": now.isoformat(), "state": "degraded"},
            "predicted_future": {"timestamp": (now + timedelta(hours=6)).isoformat(), "state": "monitor"},
            "entity_id": entity_id,
            "entity_type": entity_type,
        }


class ContextQualityEngine:
    """Score the quality of a context object."""

    def score(self, *, context: ContextObject, correlation: CorrelationResult) -> dict[str, Any]:
        completeness = 0.8 if context.inventory_summary else 0.5
        freshness = 0.9
        confidence = round(min(0.95, 0.5 + correlation.score), 2)
        consistency = 0.85 if context.kpi_summary and context.alarm_summary else 0.6
        explainability = 0.9 if correlation.evidence else 0.6
        return {
            "completeness": round(completeness, 2),
            "freshness": round(freshness, 2),
            "confidence": confidence,
            "consistency": round(consistency, 2),
            "explainability": round(explainability, 2),
        }


class ContextIntelligenceEngine:
    """Compose context intelligence from the existing context builder outputs."""

    def __init__(self) -> None:
        self._correlation_engine = ContextCorrelationEngine()
        self._evidence_engine = ContextEvidenceEngine()
        self._business_impact_engine = BusinessImpactEngine()
        self._timeline_engine = ContextTimelineEngine()
        self._quality_engine = ContextQualityEngine()

    def build_context_intelligence(
        self,
        *,
        entity_id: str,
        entity_type: str,
        inventory: dict[str, Any] | None = None,
        kpis: dict[str, Any] | None = None,
        alarms: dict[str, Any] | None = None,
        weather: dict[str, Any] | None = None,
        maintenance: dict[str, Any] | None = None,
        traffic: dict[str, Any] | None = None,
        topology: dict[str, Any] | None = None,
        neighbor_cells: list[str] | None = None,
        configuration: dict[str, Any] | None = None,
        subscribers: int = 5000,
        revenue_per_sub: float = 5.0,
    ) -> dict[str, Any]:
        inventory = inventory or {}
        kpis = kpis or {}
        alarms = alarms or {}
        weather = weather or {}
        maintenance = maintenance or {}
        traffic = traffic or {}
        topology = topology or {}
        neighbor_cells = neighbor_cells or []
        configuration = configuration or {}

        context = ContextObject(
            entity_id=entity_id,
            entity_type=entity_type,
            inventory_summary=inventory,
            kpi_summary=kpis,
            alarm_summary=alarms,
            weather_summary=weather,
            insights=["Context intelligence generated"],
        )
        correlation = self._correlation_engine.correlate(
            inventory=inventory,
            kpis=kpis,
            alarms=alarms,
            weather=weather,
            maintenance=maintenance,
            traffic=traffic,
            topology=topology,
            neighbor_cells=neighbor_cells,
            configuration=configuration,
        )
        evidence = self._evidence_engine.build_evidence(context=context, correlation=correlation)
        business_impact = self._business_impact_engine.estimate(correlation=correlation, subscribers=subscribers, revenue_per_sub=revenue_per_sub)
        timeline = self._timeline_engine.build_timeline(entity_id=entity_id, entity_type=entity_type)
        quality = self._quality_engine.score(context=context, correlation=correlation)

        return {
            "context": context.to_dict(),
            "correlation": {"score": correlation.score, "explanation": correlation.explanation, "evidence": correlation.evidence},
            "evidence": evidence,
            "business_impact": business_impact,
            "timeline": timeline,
            "quality": quality,
        }
