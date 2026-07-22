from app.reasoning.models import ReasoningRequest
from app.reasoning.services import ReasoningEngine


def test_reasoning_engine_returns_reasoning_response() -> None:
    engine = ReasoningEngine()
    request = ReasoningRequest(
        entity_id="site-001",
        entity_type="site",
        context={
            "inventory_summary": {"technology": "5G"},
            "kpi_summary": {"avg_rsrp": -110, "availability": 0.98},
            "alarm_summary": {"severity": "Major", "count": 2},
            "weather_summary": {"condition": "Storm"},
        },
        correlation={"score": 0.8},
        evidence={"confidence": 0.9},
    )

    response = engine.reason(request)

    assert response.entity_id == "site-001"
    assert response.entity_type == "site"
    assert response.root_causes
    assert response.recommendations
    assert response.prediction.degradation_risk in {"High", "Medium", "Low"}
    assert 0.0 <= response.confidence <= 1.0
    assert response.decision.business_priority in {"P1", "P2", "P3"}
