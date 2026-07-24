from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ExecutionStepResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    module: str
    status: str
    started_at: str
    completed_at: str | None = None
    duration_ms: float | None = Field(default=None, ge=0.0)
    output: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None


class ExecutionContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_id: str = Field(default_factory=lambda: f"kernel-{uuid4().hex}")
    entity_id: str = Field(min_length=1)
    entity_type: str = Field(default="site", min_length=1)
    pipeline: list[str] = Field(default_factory=list)
    input_payload: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    artifacts: dict[str, dict[str, Any]] = Field(default_factory=dict)
    steps: list[ExecutionStepResult] = Field(default_factory=list)
    status: str = Field(default="pending")
    started_at: str = Field(default_factory=_utc_now)
    completed_at: str | None = None

    def add_artifact(self, module: str, output: dict[str, Any]) -> None:
        self.artifacts[module] = output

    def add_step(self, step: ExecutionStepResult) -> None:
        self.steps.append(step)

    def complete(self) -> None:
        self.status = "completed"
        self.completed_at = _utc_now()

    def fail(self) -> None:
        self.status = "failed"
        self.completed_at = _utc_now()


class KernelExecuteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    module: str = Field(min_length=1)
    entity_id: str = Field(min_length=1)
    entity_type: str = Field(default="site", min_length=1)
    payload: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    persist_memory: bool = False


class KernelPipelineRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str = Field(min_length=1)
    entity_type: str = Field(default="site", min_length=1)
    payload: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    pipeline: list[str] = Field(default_factory=list)
    persist_memory: bool = False


class RegisteredModuleInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    version: str
    capabilities: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)
    healthy: bool


class ModuleHealthStatus(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    status: str
    details: dict[str, Any] = Field(default_factory=dict)


class KernelHealthSnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    lifecycle_state: str
    started_at: str | None = None
    loaded_plugins: list[str] = Field(default_factory=list)
    modules: list[ModuleHealthStatus] = Field(default_factory=list)
    metrics: dict[str, Any] = Field(default_factory=dict)


class KernelExecutionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_id: str
    entity_id: str
    entity_type: str
    status: str
    pipeline: list[str] = Field(default_factory=list)
    steps: list[ExecutionStepResult] = Field(default_factory=list)
    artifacts: dict[str, dict[str, Any]] = Field(default_factory=dict)
    started_at: str
    completed_at: str | None = None
