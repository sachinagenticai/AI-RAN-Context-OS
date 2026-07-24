from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.connectors.utils.helpers import utc_now


class ConnectorState(str, Enum):
    REGISTERED = "registered"
    INITIALIZED = "initialized"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"


class ConnectorConfiguration(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_type: str = Field(min_length=1)
    name: str = Field(min_length=1)
    version: str = Field(default="1.0.0", min_length=1)
    description: str = Field(default="")
    auth_type: str = Field(default="none")
    endpoint: str | None = None
    capabilities: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)
    settings: dict[str, Any] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)


class ConnectorMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_id: str
    connector_type: str
    name: str
    version: str
    description: str = ""
    capabilities: list[str] = Field(default_factory=list)
    dependencies: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    async_supported: bool = True


class ConnectorRuntimeStatus(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_id: str
    state: ConnectorState = ConnectorState.REGISTERED
    initialized: bool = False
    running: bool = False
    restart_count: int = 0
    last_started_at: str | None = None
    last_stopped_at: str | None = None
    last_heartbeat_at: str | None = None
    last_error: str | None = None


class ConnectorHealth(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_id: str
    status: str = "unknown"
    availability: float = Field(default=1.0, ge=0.0, le=1.0)
    latency_ms: float = Field(default=0.0, ge=0.0)
    error_count: int = Field(default=0, ge=0)
    last_sync: str | None = None
    last_heartbeat: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class ConnectorMetrics(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_id: str
    connections: int = 0
    messages: int = 0
    records: int = 0
    latency_ms: float = Field(default=0.0, ge=0.0)
    failures: int = 0
    retries: int = 0
    availability: float = Field(default=1.0, ge=0.0, le=1.0)


class ConnectorRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: ConnectorMetadata
    configuration: ConnectorConfiguration
    status: ConnectorRuntimeStatus


class ConnectorDetail(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: ConnectorMetadata
    configuration: ConnectorConfiguration
    status: ConnectorRuntimeStatus
    health: ConnectorHealth
    metrics: ConnectorMetrics


class ConnectorRegistrationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_id: str = Field(min_length=1)
    configuration: ConnectorConfiguration
    auto_start: bool = False


class ConnectorActionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_id: str = Field(min_length=1)


class ConnectorTypeDescriptor(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_type: str
    capabilities: list[str] = Field(default_factory=list)
    description: str = ""
    transport: str = "mock"
    mode: str = "async"


class ConnectorDiscoveryResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    registered_connectors: list[str] = Field(default_factory=list)
    available_connectors: list[ConnectorTypeDescriptor] = Field(default_factory=list)
    transformation_profiles: list[str] = Field(default_factory=list)


class ConnectorCapabilityCatalog(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connectors: dict[str, list[str]] = Field(default_factory=dict)
    available_types: dict[str, list[str]] = Field(default_factory=dict)


class ConnectorEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str
    payload: dict[str, Any]
    timestamp: str = Field(default_factory=utc_now)