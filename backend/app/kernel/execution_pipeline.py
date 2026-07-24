from __future__ import annotations

from time import perf_counter

from fastapi.encoders import jsonable_encoder

from app.kernel.execution_context import ExecutionContext, ExecutionStepResult
from app.kernel.metrics import RuntimeMetrics
from app.kernel.registry import ModuleRegistry


class ExecutionPipeline:
    def __init__(self, *, registry: ModuleRegistry, metrics: RuntimeMetrics) -> None:
        self._registry = registry
        self._metrics = metrics

    def execute(self, *, context: ExecutionContext, modules: list[str]) -> ExecutionContext:
        for module_name in modules:
            runtime_module = self._registry.get_module(module_name)
            started_at = perf_counter()
            step = ExecutionStepResult(module=module_name, status="running", started_at=context.started_at)
            try:
                raw_output = runtime_module.execute(context)
                output = jsonable_encoder(raw_output)
                duration_ms = (perf_counter() - started_at) * 1000
                self._metrics.record_success(module_name, duration_ms)
                step.status = "completed"
                step.completed_at = context.completed_at or context.started_at
                step.duration_ms = round(duration_ms, 3)
                step.output = output
                context.add_artifact(module_name, output)
                context.add_step(step)
            except Exception as exc:
                duration_ms = (perf_counter() - started_at) * 1000
                self._metrics.record_failure(module_name, duration_ms)
                step.status = "failed"
                step.completed_at = context.completed_at or context.started_at
                step.duration_ms = round(duration_ms, 3)
                step.error = str(exc)
                context.add_step(step)
                context.fail()
                raise
        context.complete()
        return context
