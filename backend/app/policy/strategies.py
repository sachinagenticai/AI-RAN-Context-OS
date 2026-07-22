from __future__ import annotations

from typing import Any

from app.policy.models import ApprovalLevel, Policy, PolicyResult, PolicyRule, PolicyViolation


class PolicyStrategy:
    """Strategy interface for evaluating a policy against a reasoning result."""

    def evaluate(self, policy: Policy, reasoning: dict[str, Any]) -> tuple[list[PolicyViolation], str, ApprovalLevel, float]:
        raise NotImplementedError


class DefaultPolicyStrategy(PolicyStrategy):
    """Default deterministic evaluator for simple policy conditions."""

    def evaluate(self, policy: Policy, reasoning: dict[str, Any]) -> tuple[list[PolicyViolation], str, ApprovalLevel, float]:
        violations: list[PolicyViolation] = []
        matched_rules: list[str] = []
        risk_score = float(reasoning.get("risk_score", 0.0))
        approval_level = ApprovalLevel.AUTO_APPROVE
        status = "Approved"

        for rule in policy.rules:
            if self._matches(rule, reasoning):
                matched_rules.append(rule.name)
                if rule.action == "reject":
                    violations.append(PolicyViolation(rule_id=rule.id, rule_name=rule.name, category=rule.category, severity=rule.severity, message=rule.description))
                    status = "Rejected"
                    approval_level = rule.approval_level
                    risk_score = max(risk_score, rule.risk_threshold)
                elif rule.action == "human_approval":
                    violations.append(PolicyViolation(rule_id=rule.id, rule_name=rule.name, category=rule.category, severity=rule.severity, message=rule.description))
                    status = "Requires Human Approval"
                    approval_level = rule.approval_level
                    risk_score = max(risk_score, rule.risk_threshold)

        if status == "Approved" and risk_score >= 0.8:
            status = "Requires Human Approval"
            approval_level = ApprovalLevel.SUPERVISOR

        return violations, status, approval_level, round(min(1.0, max(0.0, risk_score)), 2)

    def _matches(self, rule: PolicyRule, reasoning: dict[str, Any]) -> bool:
        action = str(reasoning.get("recommended_action", "")).lower()
        risk_score = float(reasoning.get("risk_score", 0.0))
        prediction = reasoning.get("prediction", {})
        sla_risk = str(prediction.get("sla_violation_risk", "")).lower()

        if rule.condition == "risk_score >= 0.8":
            return risk_score >= 0.8
        if rule.condition == "action contains dispatch":
            return "dispatch" in action
        if rule.condition == "sla_violation_risk == High":
            return sla_risk == "high"
        return False
