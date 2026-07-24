from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_memory_store_api_returns_200() -> None:
    payload = {
        "id": "mem-api-1",
        "entity_id": "site-001",
        "entity_type": "site",
        "category": "Operational",
        "payload": {"incident": "outage"},
        "incident_id": "inc-1",
    }

    response = client.post("/api/v1/memory/store", json=payload)

    assert response.status_code == 200
    assert response.json()["id"] == "mem-api-1"


def test_memory_summary_api_returns_200() -> None:
    response = client.get("/api/v1/memory/summary?entity_id=site-001&entity_type=site")
    assert response.status_code == 200
