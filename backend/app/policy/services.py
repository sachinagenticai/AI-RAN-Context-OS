from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any

from app.policy.exceptions import PolicyValidationError
from app.policy.loader import PolicyLoader
from app.policy.models import ApprovalLevel, Policy, PolicyResult, PolicyViolation, PolicyVersion
from app.policy.strategies import DefaultPolicyStrategy, PolicyStrategy


class PolicyEvaluationEngine:
    """Evaluate reasoning output against configured policies."""

    def __init__(self, loader: PolicyLoader | None = None, strategy: PolicyStrategy | None = None) -> None:
        self.loader = loader or PolicyLoader()
        self.strategy = strategy or DefaultPolicyStrategy()

    def evaluate(self, reasoning_output: dict[str, Any], request_id: str | None = None) -> PolicyResult:
        if not isinstance(reasoning_output, dict):
            raise PolicyValidationError("Reasoning output must be a mapping")

        policies = self.loader.load()
        enabled_policies = [policy for policy in policies if policy.enabled]
        if not enabled_policies:
            raise PolicyValidationError("No enabled policies available")

        matched_rules: list[str] = []
        violations: list[PolicyViolation] = []
        status = "Approved"
        approval_level = ApprovalLevel.AUTO_APPROVE
        risk_score = float(reasoning_output.get("risk_score", 0.0))
        policy_version = enabled_policies[0].version

        start_time = time.perf_counter()
        for policy in enabled_policies:
            policy_violations, policy_status, policy_approval_level, policy_risk = self.strategy.evaluate(policy, reasoning_output)
            matched_rules.extend([rule for rule in policy.rules if rule.name in policy_violations])
            violations.extend(policy_violations)
            if policy_status == "Rejected":
                status = "Rejected"
                approval_level = policy_approval_level
                risk_score = max(risk_score, policy_risk)
            elif policy_status == "Requires Human Approval" and status != "Rejected":
                status = "Requires Human Approval"
                approval_level = policy_approval_level
                risk_score = max(risk_score, policy_risk)
            else:
                risk_score = max(risk_score, policy_risk)
        evaluation_time = round(time.perf_counter() - start_time, 6)

        return PolicyResult(
            status=status,
            reason="Policy evaluation completed" if status == "Approved" else "Policy evaluation detected a violation",
            matched_rules=[rule for rule in matched_rules if rule],
            violations=violations,
            risk_score=round(min(1.0, max(0.0, risk_score)), 2),
            approval_level=approval_level,
            request_id=request_id or "req-001",
            policy_version=policy_version,
            timestamp=datetime.now(timezone.utc).isoformat(),
            evaluation_time=evaluation_time,
        )

    def list_policies(self) -> PolicyVersion:
        policies = self.loader.load()
        return PolicyVersion(version=policies[0].version, policies=policies)

    def get_latest_version(self) -> str:
        policies = self.loader.load()
        return policies[0].version
