from __future__ import annotations

from app.kernel.execution_context import KernelHealthSnapshot, ModuleHealthStatus
from app.kernel.lifecycle import KernelLifecycleManager
from app.kernel.metrics import RuntimeMetrics
from app.kernel.registry import ModuleRegistry


class KernelHealthMonitor:
    def __init__(self, *, registry: ModuleRegistry, lifecycle: KernelLifecycleManager, metrics: RuntimeMetrics) -> None:
        self._registry = registry
        self._lifecycle = lifecycle
        self._metrics = metrics

    def get_health(self) -> KernelHealthSnapshot:
        module_statuses: list[ModuleHealthStatus] = []
        degraded = self._lifecycle.state != "running"

        for descriptor in self._registry.list_modules():
            runtime_module = self._registry.get_module(descriptor.name)
            try:
                details = runtime_module.healthcheck()
                status = str(details.get("status", "ok"))
            except Exception as exc:
                details = {"error": str(exc)}
                status = "error"
            if status != "ok":
                degraded = True
            module_statuses.append(ModuleHealthStatus(name=descriptor.name, status=status, details=details))

        overall_status = "ok" if not degraded else "degraded"
        if self._lifecycle.state == "stopped":
            overall_status = "stopped"

        return KernelHealthSnapshot(
            status=overall_status,
            lifecycle_state=self._lifecycle.state,
            started_at=self._lifecycle.started_at,
            loaded_plugins=list(self._lifecycle.loaded_plugins),
            modules=module_statuses,
            metrics=self._metrics.snapshot(),
        )
