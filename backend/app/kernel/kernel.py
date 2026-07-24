from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Callable

from fastapi import APIRouter, Depends, HTTPException, Query

from app.integrations.openai.client import OpenAIClient
from app.integrations.openai.prompt_manager import PromptManager, PromptTemplate
from app.integrations.openai.response_parser import ResponseParser
from app.integrations.openai.tool_registry import ToolRegistry
from app.memory.models import MemoryCategory, MemoryEntry
from app.memory.services import MemoryService
from app.policy.services import PolicyEvaluationEngine
from app.reasoning.models import ReasoningRequest
from app.reasoning.services import ReasoningEngine
from app.services.openai.openai_service import OpenAIService
from app.synthetic_data.services.context_intelligence import ContextIntelligenceEngine
from app.kernel.execution_context import (
    ExecutionContext,
    KernelExecuteRequest,
    KernelExecutionResponse,
    KernelHealthSnapshot,
    KernelPipelineRequest,
    RegisteredModuleInfo,
)
from app.kernel.execution_pipeline import ExecutionPipeline
from app.kernel.health import KernelHealthMonitor
from app.kernel.lifecycle import KernelLifecycleManager
from app.kernel.metrics import RuntimeMetrics
from app.kernel.orchestrator import KernelOrchestrator
from app.kernel.registry import ModuleRegistry


@dataclass(slots=True)
class _CallableKernelModule:
    name: str
    version: str
    capabilities: tuple[str, ...]
    dependencies: tuple[str, ...]
    executor: Callable[[ExecutionContext], dict[str, Any]]
    probe: Callable[[], dict[str, Any]]

    def execute(self, context: ExecutionContext) -> dict[str, Any]:
        return self.executor(context)

    def healthcheck(self) -> dict[str, Any]:
        return self.probe()


def _merge_mapping(base: dict[str, Any] | None, override: dict[str, Any] | None) -> dict[str, Any]:
    merged = dict(base or {})
    merged.update(override or {})
    return merged


def _serialize_artifact(payload: Any) -> str:
    return json.dumps(payload, sort_keys=True, default=str)


def _build_openai_service() -> OpenAIService:
    prompt_manager = PromptManager(
        [
            PromptTemplate("kernel_execution", "Kernel execution context: {context}"),
            PromptTemplate("kernel_summary", "Summarize telecom runtime state: {context}"),
        ]
    )
    tool_registry = ToolRegistry()
    tool_registry.register("kernel_context_lookup", lambda: None)
    return OpenAIService(
        client=OpenAIClient(),
        prompt_manager=prompt_manager,
        tool_registry=tool_registry,
        response_parser=ResponseParser(),
    )


class EnterpriseAIKernel:
    def __init__(self, plugin_paths: list[str] | None = None) -> None:
        self.registry = ModuleRegistry()
        self.metrics = RuntimeMetrics()
        self.lifecycle = KernelLifecycleManager()
        self.pipeline = ExecutionPipeline(registry=self.registry, metrics=self.metrics)
        self.orchestrator = KernelOrchestrator(registry=self.registry, pipeline=self.pipeline)
        self.health_monitor = KernelHealthMonitor(registry=self.registry, lifecycle=self.lifecycle, metrics=self.metrics)
        self._register_builtin_modules()
        self.lifecycle.start(registry=self.registry, plugin_paths=plugin_paths)

    def _register_builtin_modules(self) -> None:
        context_engine = ContextIntelligenceEngine()
        reasoning_engine = ReasoningEngine()
        policy_engine = PolicyEvaluationEngine()
        memory_service = MemoryService()
        llm_service = _build_openai_service()

        self.registry.register(
            _CallableKernelModule(
                name="context_intelligence",
                version="1.0.0",
                capabilities=("context-build", "module-discovery"),
                dependencies=(),
                executor=lambda context: context_engine.build_context_intelligence(
                    entity_id=context.entity_id,
                    entity_type=context.entity_type,
                    inventory=context.input_payload.get("inventory"),
                    kpis=context.input_payload.get("kpis"),
                    alarms=context.input_payload.get("alarms"),
                    weather=context.input_payload.get("weather"),
                    maintenance=context.input_payload.get("maintenance"),
                    traffic=context.input_payload.get("traffic"),
                    topology=context.input_payload.get("topology"),
                    neighbor_cells=context.input_payload.get("neighbor_cells"),
                    configuration=context.input_payload.get("configuration"),
                    subscribers=context.input_payload.get("subscribers", 5000),
                    revenue_per_sub=context.input_payload.get("revenue_per_sub", 5.0),
                ),
                probe=lambda: {"status": "ok", "module": "ContextIntelligenceEngine"},
            )
        )
        self.registry.register(
            _CallableKernelModule(
                name="reasoning_engine",
                version="1.0.0",
                capabilities=("reasoning", "dependency-resolution"),
                dependencies=("context_intelligence",),
                executor=lambda context: reasoning_engine.reason(
                    ReasoningRequest(
                        entity_id=context.entity_id,
                        entity_type=context.entity_type,
                        context=_merge_mapping(
                            context.artifacts.get("context_intelligence", {}).get("context"),
                            context.input_payload.get("context"),
                        ),
                        correlation=_merge_mapping(
                            context.artifacts.get("context_intelligence", {}).get("correlation"),
                            context.input_payload.get("correlation"),
                        ),
                        evidence=_merge_mapping(
                            context.artifacts.get("context_intelligence", {}).get("evidence"),
                            context.input_payload.get("evidence"),
                        ),
                        business_impact=_merge_mapping(
                            context.artifacts.get("context_intelligence", {}).get("business_impact"),
                            context.input_payload.get("business_impact"),
                        ),
                        timeline=_merge_mapping(
                            context.artifacts.get("context_intelligence", {}).get("timeline"),
                            context.input_payload.get("timeline"),
                        ),
                        quality=_merge_mapping(
                            context.artifacts.get("context_intelligence", {}).get("quality"),
                            context.input_payload.get("quality"),
                        ),
                    )
                ).model_dump(mode="json"),
                probe=lambda: {"status": "ok", "module": "ReasoningEngine"},
            )
        )
        self.registry.register(
            _CallableKernelModule(
                name="policy_engine",
                version="1.0.0",
                capabilities=("policy-evaluation", "request-orchestration"),
                dependencies=("reasoning_engine",),
                executor=lambda context: policy_engine.evaluate(
                    {
                        "risk_score": context.input_payload.get(
                            "risk_score",
                            context.artifacts.get("reasoning_engine", {}).get("decision", {}).get("estimated_risk", 0.0),
                        ),
                        "recommended_action": context.input_payload.get(
                            "recommended_action",
                            context.artifacts.get("reasoning_engine", {}).get("decision", {}).get("recommended_action", "Continue monitoring"),
                        ),
                        "prediction": context.input_payload.get(
                            "prediction",
                            context.artifacts.get("reasoning_engine", {}).get("prediction", {}),
                        ),
                        "confidence": context.input_payload.get(
                            "confidence",
                            context.artifacts.get("reasoning_engine", {}).get("confidence", 0.0),
                        ),
                    },
                    request_id=context.request_id,
                ).model_dump(mode="json"),
                probe=lambda: {"status": "ok", "module": "PolicyEvaluationEngine"},
            )
        )
        self.registry.register(
            _CallableKernelModule(
                name="enterprise_memory",
                version="1.0.0",
                capabilities=("memory-write", "pipeline-execution"),
                dependencies=(),
                executor=lambda context: memory_service.store_entry(
                    MemoryEntry(
                        id=context.input_payload.get("memory_id", f"{context.request_id}-memory"),
                        entity_id=context.entity_id,
                        entity_type=context.entity_type,
                        category=MemoryCategory(context.input_payload.get("memory_category", "Policy" if "policy_engine" in context.artifacts else "Decision")),
                        payload=context.input_payload.get(
                            "memory_payload",
                            {
                                "reasoning": context.artifacts.get("reasoning_engine", {}),
                                "policy": context.artifacts.get("policy_engine", {}),
                            },
                        ),
                        incident_id=context.input_payload.get("incident_id"),
                        policy_id=context.artifacts.get("policy_engine", {}).get("policy_version"),
                    )
                ).model_dump(mode="json"),
                probe=lambda: {"status": "ok", "module": "MemoryService"},
            )
        )
        self.registry.register(
            _CallableKernelModule(
                name="llm_gateway",
                version="1.0.0",
                capabilities=("llm-execution", "plugin-loading"),
                dependencies=(),
                executor=lambda context: llm_service.execute(
                    prompt_name=context.metadata.get("prompt_name", "kernel_execution"),
                    context=context.input_payload.get(
                        "llm_context",
                        _serialize_artifact(
                            context.artifacts.get("policy_engine")
                            or context.artifacts.get("reasoning_engine")
                            or context.artifacts.get("context_intelligence")
                            or context.input_payload
                        ),
                    ),
                ),
                probe=lambda: {"status": "ok", "module": "OpenAIService"},
            )
        )

    def list_modules(self, capability: str | None = None) -> list[RegisteredModuleInfo]:
        modules = []
        for descriptor in self.registry.discover_modules(capability):
            health = self.registry.get_module(descriptor.name).healthcheck()
            modules.append(
                RegisteredModuleInfo(
                    name=descriptor.name,
                    version=descriptor.version,
                    capabilities=list(descriptor.capabilities),
                    dependencies=list(descriptor.dependencies),
                    healthy=health.get("status") == "ok",
                )
            )
        return modules

    def get_health(self) -> KernelHealthSnapshot:
        return self.health_monitor.get_health()

    def execute(self, request: KernelExecuteRequest) -> KernelExecutionResponse:
        return self.orchestrator.execute_module(request)

    def run_pipeline(self, request: KernelPipelineRequest) -> KernelExecutionResponse:
        return self.orchestrator.execute_pipeline(request)


kernel = EnterpriseAIKernel()
router = APIRouter(prefix="/kernel", tags=["kernel"])


def get_kernel() -> EnterpriseAIKernel:
    return kernel


@router.get("/health", response_model=KernelHealthSnapshot)
async def kernel_health(runtime: EnterpriseAIKernel = Depends(get_kernel)) -> KernelHealthSnapshot:
    return runtime.get_health()


@router.get("/modules", response_model=list[RegisteredModuleInfo])
async def kernel_modules(
    capability: str | None = Query(default=None),
    runtime: EnterpriseAIKernel = Depends(get_kernel),
) -> list[RegisteredModuleInfo]:
    return runtime.list_modules(capability)


@router.post("/pipeline", response_model=KernelExecutionResponse)
async def execute_pipeline(
    request: KernelPipelineRequest,
    runtime: EnterpriseAIKernel = Depends(get_kernel),
) -> KernelExecutionResponse:
    try:
        return runtime.run_pipeline(request)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/execute", response_model=KernelExecutionResponse)
async def execute_module(
    request: KernelExecuteRequest,
    runtime: EnterpriseAIKernel = Depends(get_kernel),
) -> KernelExecutionResponse:
    try:
        return runtime.execute(request)
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc