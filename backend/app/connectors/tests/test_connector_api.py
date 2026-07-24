from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_connector_discovery_and_capabilities_endpoints_return_framework_metadata() -> None:
    discovery = client.get("/api/v1/connectors/discover")
    capabilities = client.get("/api/v1/connectors/capabilities")

    assert discovery.status_code == 200
    assert capabilities.status_code == 200
    assert {item["connector_type"] for item in discovery.json()["available_connectors"]} >= {"synthetic", "rest", "webhook", "csv", "file", "kafka_mock", "openai_wrapper"}
    assert "available_types" in capabilities.json()


def test_connector_registration_and_lifecycle_endpoints_work_end_to_end() -> None:
    registration = client.post(
        "/api/v1/connectors/register",
        json={
            "connector_id": "rest-api-test",
            "configuration": {"connector_type": "rest", "name": "REST API Test"},
            "auto_start": True,
        },
    )
    assert registration.status_code == 200
    assert registration.json()["status"]["state"] == "running"

    detail = client.get("/api/v1/connectors/rest-api-test")
    status = client.get("/api/v1/connectors/status", params={"connector_id": "rest-api-test"})
    health = client.get("/api/v1/connectors/health", params={"connector_id": "rest-api-test"})
    restart = client.post("/api/v1/connectors/restart", json={"connector_id": "rest-api-test"})
    stop = client.post("/api/v1/connectors/stop", json={"connector_id": "rest-api-test"})

    assert detail.status_code == 200
    assert detail.json()["metadata"]["connector_type"] == "rest"
    assert status.status_code == 200
    assert status.json()[0]["connector_id"] == "rest-api-test"
    assert health.status_code == 200
    assert health.json()[0]["status"] in {"up", "idle", "down"}
    assert restart.status_code == 200
    assert restart.json()["restart_count"] >= 1
    assert stop.status_code == 200
    assert stop.json()["state"] == "stopped"