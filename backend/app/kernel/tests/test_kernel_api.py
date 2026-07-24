from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_kernel_health_endpoint_returns_runtime_snapshot() -> None:
    response = client.get("/api/v1/kernel/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] in {"ok", "degraded", "stopped"}
    assert payload["lifecycle_state"] == "running"
    assert isinstance(payload["modules"], list)


def test_kernel_modules_endpoint_returns_registered_modules() -> None:
    response = client.get("/api/v1/kernel/modules")

    assert response.status_code == 200
    names = {module["name"] for module in response.json()}
    assert {"context_intelligence", "reasoning_engine", "policy_engine", "enterprise_memory", "llm_gateway"}.issubset(names)


def test_kernel_pipeline_endpoint_executes_registered_modules() -> None:
    response = client.post(
        "/api/v1/kernel/pipeline",
        json={
            "entity_id": "site-101",
            "entity_type": "site",
            "payload": {
                "inventory": {"technology": "5G"},
                "kpis": {"avg_rsrp": -108},
                "alarms": {"severity": "Major"},
                "weather": {"condition": "Storm"},
            },
            "persist_memory": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "completed"
    assert payload["pipeline"] == ["context_intelligence", "reasoning_engine", "policy_engine", "enterprise_memory"]
    assert "policy_engine" in payload["artifacts"]


def test_kernel_execute_endpoint_runs_target_module() -> None:
    response = client.post(
        "/api/v1/kernel/execute",
        json={
            "module": "llm_gateway",
            "entity_id": "site-102",
            "payload": {"llm_context": "critical outage summary"},
            "metadata": {"prompt_name": "kernel_summary"},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["pipeline"] == ["llm_gateway"]
    assert payload["artifacts"]["llm_gateway"]["status"] in {"mocked", "ok"}


def test_kernel_execute_endpoint_rejects_unknown_modules() -> None:
    response = client.post(
        "/api/v1/kernel/execute",
        json={
            "module": "does_not_exist",
            "entity_id": "site-999",
        },
    )

    assert response.status_code == 400
    assert "does_not_exist" in response.json()["detail"]