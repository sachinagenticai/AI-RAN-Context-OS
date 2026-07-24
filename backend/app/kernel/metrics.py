from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone


class RuntimeMetrics:
    def __init__(self) -> None:
        self._total_executions = 0
        self._successful_executions = 0
        self._failed_executions = 0
        self._module_executions: dict[str, int] = defaultdict(int)
        self._module_failures: dict[str, int] = defaultdict(int)
        self._latency_samples: list[float] = []
        self._last_execution_at: str | None = None

    def record_success(self, module: str, duration_ms: float) -> None:
        self._total_executions += 1
        self._successful_executions += 1
        self._module_executions[module] += 1
        self._latency_samples.append(round(duration_ms, 3))
        self._last_execution_at = datetime.now(timezone.utc).isoformat()

    def record_failure(self, module: str, duration_ms: float) -> None:
        self._total_executions += 1
        self._failed_executions += 1
        self._module_executions[module] += 1
        self._module_failures[module] += 1
        self._latency_samples.append(round(duration_ms, 3))
        self._last_execution_at = datetime.now(timezone.utc).isoformat()

    def snapshot(self) -> dict[str, object]:
        average_latency = round(sum(self._latency_samples) / len(self._latency_samples), 3) if self._latency_samples else 0.0
        return {
            "total_executions": self._total_executions,
            "successful_executions": self._successful_executions,
            "failed_executions": self._failed_executions,
            "module_executions": dict(sorted(self._module_executions.items())),
            "module_failures": dict(sorted(self._module_failures.items())),
            "average_latency_ms": average_latency,
            "last_execution_at": self._last_execution_at,
        }
