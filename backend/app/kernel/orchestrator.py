from __future__ import annotations

from app.kernel.execution_context import ExecutionContext, KernelExecuteRequest, KernelExecutionResponse, KernelPipelineRequest
from app.kernel.execution_pipeline import ExecutionPipeline
from app.kernel.registry import ModuleRegistry


class KernelOrchestrator:
    def __init__(self, *, registry: ModuleRegistry, pipeline: ExecutionPipeline) -> None:
        self._registry = registry
        self._pipeline = pipeline

    def execute_module(self, request: KernelExecuteRequest) -> KernelExecutionResponse:
        module_plan = self.resolve_modules([request.module])
        if request.persist_memory and "enterprise_memory" not in module_plan:
            module_plan.append("enterprise_memory")
        context = ExecutionContext(
            entity_id=request.entity_id,
            entity_type=request.entity_type,
            pipeline=module_plan,
            input_payload=request.payload,
            metadata=request.metadata,
        )
        executed_context = self._pipeline.execute(context=context, modules=module_plan)
        return self._to_response(executed_context)

    def execute_pipeline(self, request: KernelPipelineRequest) -> KernelExecutionResponse:
        requested_modules = request.pipeline or ["context_intelligence", "reasoning_engine", "policy_engine"]
        module_plan = self.resolve_modules(requested_modules)
        if request.persist_memory and "enterprise_memory" not in module_plan:
            module_plan.append("enterprise_memory")
        context = ExecutionContext(
            entity_id=request.entity_id,
            entity_type=request.entity_type,
            pipeline=module_plan,
            input_payload=request.payload,
            metadata=request.metadata,
        )
        executed_context = self._pipeline.execute(context=context, modules=module_plan)
        return self._to_response(executed_context)

    def resolve_modules(self, requested_modules: list[str]) -> list[str]:
        ordered: list[str] = []
        visiting: set[str] = set()
        visited: set[str] = set()

        def visit(module_name: str) -> None:
            if module_name in visited:
                return
            if module_name in visiting:
                raise ValueError(f"Circular dependency detected for module '{module_name}'")
            runtime_module = self._registry.get_module(module_name)
            visiting.add(module_name)
            for dependency in runtime_module.dependencies:
                visit(dependency)
            visiting.remove(module_name)
            visited.add(module_name)
            ordered.append(module_name)

        for module_name in requested_modules:
            visit(module_name)
        return ordered

    def _to_response(self, context: ExecutionContext) -> KernelExecutionResponse:
        return KernelExecutionResponse(
            request_id=context.request_id,
            entity_id=context.entity_id,
            entity_type=context.entity_type,
            status=context.status,
            pipeline=context.pipeline,
            steps=context.steps,
            artifacts=context.artifacts,
            started_at=context.started_at,
            completed_at=context.completed_at,
        )
