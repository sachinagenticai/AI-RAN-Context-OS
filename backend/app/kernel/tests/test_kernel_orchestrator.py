from __future__ import annotations

from app.kernel.execution_context import ExecutionContext, KernelExecuteRequest, KernelPipelineRequest
from app.kernel.execution_pipeline import ExecutionPipeline
from app.kernel.kernel import EnterpriseAIKernel
from app.kernel.metrics import RuntimeMetrics
from app.kernel.registry import ModuleRegistry


class FailingModule:
    name = "failing_module"
    version = "1.0.0"
    capabilities = ("failure",)
    dependencies = ()

    def execute(self, context: ExecutionContext) -> dict[str, str]:
        raise RuntimeError("boom")

    def healthcheck(self) -> dict[str, str]:
        return {"status": "error"}


def test_kernel_executes_default_pipeline_and_persists_memory() -> None:
    kernel = EnterpriseAIKernel()

    response = kernel.run_pipeline(
        KernelPipelineRequest(
            entity_id="site-001",
            entity_type="site",
            payload={
                "inventory": {"technology": "5G"},
                "kpis": {"avg_rsrp": -110, "availability": 0.98},
                "alarms": {"severity": "Major", "count": 2},
                "weather": {"condition": "Storm"},
            },
            persist_memory=True,
        )
    )

    assert response.status == "completed"
    assert response.pipeline == ["context_intelligence", "reasoning_engine", "policy_engine", "enterprise_memory"]
    assert response.artifacts["reasoning_engine"]["decision"]["recommended_action"]
    assert response.artifacts["policy_engine"]["status"] in {"Approved", "Rejected", "Requires Human Approval"}
    assert response.artifacts["enterprise_memory"]["entity_id"] == "site-001"


def test_kernel_executes_single_module_with_dependencies() -> None:
    kernel = EnterpriseAIKernel()

    response = kernel.execute(
        KernelExecuteRequest(
            module="reasoning_engine",
            entity_id="site-002",
            entity_type="site",
            payload={
                "inventory": {"technology": "5G"},
                "kpis": {"avg_rsrp": -105},
                "alarms": {"severity": "Critical", "count": 1},
                "weather": {"condition": "Heavy Rain"},
            },
        )
    )

    assert response.status == "completed"
    assert response.pipeline == ["context_intelligence", "reasoning_engine"]
    assert response.artifacts["context_intelligence"]["context"]["entity_id"] == "site-002"
    assert response.artifacts["reasoning_engine"]["root_causes"]


def test_kernel_executes_llm_gateway_with_mocked_client() -> None:
    kernel = EnterpriseAIKernel()

    response = kernel.execute(
        KernelExecuteRequest(
            module="llm_gateway",
            entity_id="site-003",
            payload={"llm_context": "site degradation summary"},
            metadata={"prompt_name": "kernel_summary"},
        )
    )

    assert response.status == "completed"
    assert response.artifacts["llm_gateway"]["status"] in {"mocked", "ok"}
    assert "site degradation summary" in response.artifacts["llm_gateway"]["output_text"]


def test_execution_pipeline_records_failure_metrics() -> None:
    registry = ModuleRegistry()
    registry.register(FailingModule())
    metrics = RuntimeMetrics()
    pipeline = ExecutionPipeline(registry=registry, metrics=metrics)
    context = ExecutionContext(entity_id="site-004", entity_type="site", pipeline=["failing_module"])

    try:
        pipeline.execute(context=context, modules=["failing_module"])
    except RuntimeError as exc:
        assert str(exc) == "boom"
    else:
        raise AssertionError("expected pipeline execution to fail")

    snapshot = metrics.snapshot()
    assert context.status == "failed"
    assert snapshot["failed_executions"] == 1
    assert snapshot["module_failures"]["failing_module"] == 1


def test_kernel_health_reports_metrics_and_module_statuses() -> None:
    kernel = EnterpriseAIKernel()
    kernel.execute(KernelExecuteRequest(module="llm_gateway", entity_id="site-005", payload={"llm_context": "summary"}))

    health = kernel.get_health()

    assert health.status == "ok"
    assert health.lifecycle_state == "running"
    assert health.metrics["total_executions"] >= 1
    assert any(module.name == "llm_gateway" for module in health.modules)