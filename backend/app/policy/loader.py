from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml

from app.policy.exceptions import PolicyLoadError, PolicyValidationError
from app.policy.models import Policy, PolicyCategory, PolicyRule, ApprovalLevel


class PolicyLoader:
    """Load policies from YAML or JSON files."""

    def __init__(self, policy_path: str | None = None) -> None:
        self.policy_path = Path(policy_path or "/workspaces/AI-RAN-Context-OS/backend/app/policy/policies.yaml")

    def load(self) -> list[Policy]:
        if not self.policy_path.exists():
            raise PolicyLoadError(f"Policy file not found: {self.policy_path}")

        content = self.policy_path.read_text(encoding="utf-8")
        data = self._parse(content)
        policies = self._normalize(data)
        self._validate(policies)
        return policies

    def _parse(self, content: str) -> Any:
        if self.policy_path.suffix.lower() == ".json":
            return json.loads(content)
        if self.policy_path.suffix.lower() in {".yaml", ".yml"}:
            return yaml.safe_load(content)
        raise PolicyLoadError("Unsupported policy format")

    def _normalize(self, data: Any) -> list[Policy]:
        if not isinstance(data, dict):
            raise PolicyValidationError("Policy payload must be a mapping")
        raw_policies = data.get("policies", [])
        if not isinstance(raw_policies, list):
            raise PolicyValidationError("Policies must be a list")

        policies: list[Policy] = []
        for raw_policy in raw_policies:
            policy = Policy(
                id=str(raw_policy["id"]),
                name=str(raw_policy["name"]),
                version=str(raw_policy["version"]),
                description=str(raw_policy.get("description", "")),
                category=PolicyCategory(str(raw_policy["category"])),
                enabled=bool(raw_policy.get("enabled", True)),
                rules=[
                    PolicyRule(
                        id=str(rule["id"]),
                        name=str(rule["name"]),
                        category=PolicyCategory(str(rule["category"])),
                        description=str(rule.get("description", "")),
                        severity=str(rule.get("severity", "medium")),
                        condition=str(rule["condition"]),
                        action=str(rule.get("action", "allow")),
                        approval_level=ApprovalLevel(str(rule.get("approval_level", ApprovalLevel.AUTO_APPROVE.value))),
                        risk_threshold=float(rule.get("risk_threshold", 0.5)),
                    )
                    for rule in raw_policy.get("rules", [])
                ],
            )
            policies.append(policy)
        return policies

    def _validate(self, policies: list[Policy]) -> None:
        if not policies:
            raise PolicyValidationError("At least one policy is required")
        for policy in policies:
            if not policy.rules:
                raise PolicyValidationError(f"Policy {policy.id} must contain at least one rule")
