from __future__ import annotations

from app.kernel.execution_context import ExecutionContext
from app.kernel.orchestrator import KernelOrchestrator
from app.kernel.execution_pipeline import ExecutionPipeline
from app.kernel.metrics import RuntimeMetrics
from app.kernel.registry import ModuleRegistry


class StubModule:
    def __init__(self, name: str, dependencies: tuple[str, ...] = ()) -> None:
        self.name = name
        self.version = "1.0.0"
        self.capabilities = (name,)
        self.dependencies = dependencies

    def execute(self, context: ExecutionContext) -> dict[str, str]:
        return {"module": self.name, "entity_id": context.entity_id}

    def healthcheck(self) -> dict[str, str]:
        return {"status": "ok"}


def test_module_registry_registers_and_discovers_capabilities() -> None:
    registry = ModuleRegistry()
    registry.register(StubModule("context_intelligence"))
    registry.register(StubModule("reasoning_engine", dependencies=("context_intelligence",)))

    descriptors = registry.discover_modules("reasoning_engine")

    assert len(descriptors) == 1
    assert descriptors[0].name == "reasoning_engine"
    assert registry.capabilities.discover("context_intelligence") == ["context_intelligence"]


def test_module_registry_rejects_duplicate_registration() -> None:
    registry = ModuleRegistry()
    registry.register(StubModule("context_intelligence"))

    try:
        registry.register(StubModule("context_intelligence"))
    except ValueError as exc:
        assert "already registered" in str(exc)
    else:
        raise AssertionError("expected duplicate registration to fail")


def test_module_registry_validates_missing_dependencies() -> None:
    registry = ModuleRegistry()
    registry.register(StubModule("reasoning_engine", dependencies=("context_intelligence",)))

    try:
        registry.validate_dependencies()
    except ValueError as exc:
        assert "missing module 'context_intelligence'" in str(exc)
    else:
        raise AssertionError("expected dependency validation to fail")


def test_orchestrator_detects_circular_dependencies() -> None:
    registry = ModuleRegistry()
    registry.register(StubModule("context_intelligence", dependencies=("policy_engine",)))
    registry.register(StubModule("policy_engine", dependencies=("context_intelligence",)))
    orchestrator = KernelOrchestrator(
        registry=registry,
        pipeline=ExecutionPipeline(registry=registry, metrics=RuntimeMetrics()),
    )

    try:
        orchestrator.resolve_modules(["policy_engine"])
    except ValueError as exc:
        assert "Circular dependency" in str(exc)
    else:
        raise AssertionError("expected circular dependency detection")