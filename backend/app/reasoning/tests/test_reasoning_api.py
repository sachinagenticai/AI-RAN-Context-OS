from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_reasoning_api_returns_200() -> None:
    payload = {
        "entity_id": "site-001",
        "entity_type": "site",
        "context": {
            "inventory_summary": {"technology": "5G"},
            "kpi_summary": {"avg_rsrp": -110, "availability": 0.98},
            "alarm_summary": {"severity": "Major", "count": 2},
            "weather_summary": {"condition": "Storm"},
        },
        "correlation": {"score": 0.8},
        "evidence": {"confidence": 0.9},
    }

    response = client.post("/api/v1/reasoning/analyze", json=payload)

    assert response.status_code == 200
    assert response.json()["entity_id"] == "site-001"
