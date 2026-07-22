from app.policy.models import ApprovalLevel
from app.policy.services import PolicyEvaluationEngine


def test_policy_engine_evaluates_reasoning_output() -> None:
    engine = PolicyEvaluationEngine()
    reasoning_output = {
        "risk_score": 0.9,
        "recommended_action": "Dispatch field engineering team",
        "prediction": {"sla_violation_risk": "High"},
    }

    result = engine.evaluate(reasoning_output, request_id="req-1")

    assert result.status in {"Approved", "Rejected", "Requires Human Approval"}
    assert result.approval_level in ApprovalLevel
    assert result.request_id == "req-1"
    assert result.policy_version
