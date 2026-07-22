from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_policy_evaluate_api_returns_200() -> None:
    payload = {
        "risk_score": 0.9,
        "recommended_action": "Dispatch field engineering team",
        "prediction": {"sla_violation_risk": "High"},
    }

    response = client.post("/api/v1/policy/evaluate", json=payload)

    assert response.status_code == 200
    assert response.json()["status"] in {"Approved", "Rejected", "Requires Human Approval"}


def test_policy_list_api_returns_200() -> None:
    response = client.get("/api/v1/policy")
    assert response.status_code == 200
