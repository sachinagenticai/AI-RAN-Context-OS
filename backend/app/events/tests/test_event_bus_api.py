from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.events.api.router import router


app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_event_bus_api_supports_publish_status_health_history_and_metrics() -> None:
    publish = client.post(
        "/events/publish",
        json={
            "source_system": "synthetic",
            "event_type": "TelemetryReceived",
            "payload": {"entity_type": "canonical_telemetry", "id": "tel-1"},
            "metadata": {"origin": "api-test"},
            "status": "active",
        },
    )
    status = client.get("/events/status")
    health = client.get("/events/health")
    history = client.get("/events/history", params={"topic": "TelemetryReceived"})
    metrics = client.get("/events/metrics")
    topics = client.get("/events/topics")
    topic = client.get("/events/topics/TelemetryReceived")

    assert publish.status_code == 200
    assert publish.json()["accepted"] is True
    assert status.status_code == 200
    assert health.status_code == 200
    assert history.status_code == 200
    assert metrics.status_code == 200
    assert topics.status_code == 200
    assert topic.status_code == 200
    assert "TelemetryReceived" in topics.json()
    assert topic.json()["topic"] == "TelemetryReceived"


def test_event_bus_api_supports_subscribe_replay_and_dlq() -> None:
    subscribe = client.post("/events/subscribe", json={"topic": "WorkflowStarted", "subscriber_name": "api-subscriber"})
    replay = client.post("/events/replay", json={"topic": "WorkflowStarted", "limit": 10})
    dlq = client.get("/events/deadletter")

    assert subscribe.status_code == 200
    assert replay.status_code == 200
    assert dlq.status_code == 200