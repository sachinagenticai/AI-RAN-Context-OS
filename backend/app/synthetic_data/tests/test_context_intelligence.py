from app.synthetic_data.services.context_intelligence import ContextIntelligenceEngine


def test_context_intelligence_builds_correlation_evidence_and_impact() -> None:
    engine = ContextIntelligenceEngine()

    result = engine.build_context_intelligence(
        entity_id="site-001",
        entity_type="site",
        inventory={"technology": "5G", "carrier": "Operator A"},
        kpis={"avg_rsrp": -110, "availability": 0.98},
        alarms={"severity": "Major", "count": 2},
        weather={"condition": "Storm"},
        maintenance={"status": "In Progress"},
        topology={"neighbor_cells": ["cell-2", "cell-3"]},
        subscribers=10000,
        revenue_per_sub=6.5,
    )

    assert result["context"]["entity_id"] == "site-001"
    assert result["correlation"]["score"] >= 0.5
    assert result["evidence"]["confidence"] >= 0.5
    assert result["business_impact"]["priority"] == "P1"
    assert result["timeline"]["entity_id"] == "site-001"
    assert result["quality"]["confidence"] >= 0.5
