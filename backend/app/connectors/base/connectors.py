from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter
from typing import Any

from app.connectors.cache.provider import InMemoryCacheProvider
from app.connectors.events.bus import InMemoryEventBus
from app.connectors.exceptions.connector_exceptions import ConnectorLifecycleError
from app.connectors.metrics.collector import InMemoryMetricsCollector
from app.connectors.resilience.policy import ResiliencePolicy
from app.connectors.schemas.connector_schemas import (
    ConnectorConfiguration,
    ConnectorHealth,
    ConnectorMetadata,
    ConnectorMetrics,
    ConnectorRuntimeStatus,
    ConnectorState,
)
from app.connectors.transformation.provider import CanonicalTransformationProvider
from app.connectors.utils.helpers import JsonDeserializer, JsonSerializer, utc_now
from app.connectors.validators.validator import DefaultValidator


@dataclass(slots=True)
class ConnectorDependencies:
    authentication_provider: object
    authorization_provider: object
    transformer: CanonicalTransformationProvider
    validator: DefaultValidator
    cache: InMemoryCacheProvider
    retry_strategy: object
    event_bus: InMemoryEventBus
    metrics_collector: InMemoryMetricsCollector
    resilience_policy: ResiliencePolicy
    serializer: JsonSerializer
    deserializer: JsonDeserializer


class BaseConnector:
    def __init__(self, *, connector_id: str, metadata: ConnectorMetadata, configuration: ConnectorConfiguration, dependencies: ConnectorDependencies) -> None:
        self.connector_id = connector_id
        self.metadata = metadata
        self.configuration = configuration
        self._dependencies = dependencies
        self._status = ConnectorRuntimeStatus(connector_id=connector_id)
        self._health = ConnectorHealth(connector_id=connector_id)
        self._metrics = ConnectorMetrics(connector_id=connector_id)

    async def initialize(self) -> dict[str, Any]:
        self._status.state = ConnectorState.INITIALIZED
        self._status.initialized = True
        await self._dependencies.event_bus.publish_event("connector.lifecycle", {"connector_id": self.connector_id, "state": self._status.state.value})
        return await self.get_status()

    async def start(self) -> dict[str, Any]:
        self._ensure_initialized()
        self._status.state = ConnectorState.RUNNING
        self._status.running = True
        self._status.last_started_at = utc_now()
        self._metrics.connections += 1
        await self._dependencies.metrics_collector.increment(self.connector_id, "connections")
        await self.heartbeat()
        return await self.get_status()

    async def stop(self) -> dict[str, Any]:
        self._status.state = ConnectorState.STOPPED
        self._status.running = False
        self._status.last_stopped_at = utc_now()
        return await self.get_status()

    async def restart(self) -> dict[str, Any]:
        await self.stop()
        self._status.restart_count += 1
        self._metrics.retries += 1
        await self._dependencies.metrics_collector.increment(self.connector_id, "retries")
        return await self.start()

    async def reconnect(self) -> dict[str, Any]:
        return await self.restart()

    async def heartbeat(self) -> dict[str, Any]:
        timestamp = utc_now()
        self._status.last_heartbeat_at = timestamp
        self._health.last_heartbeat = timestamp
        self._health.status = "up" if self._status.running else "idle"
        return {"connector_id": self.connector_id, "heartbeat": timestamp}

    async def health_check(self) -> dict[str, Any]:
        self._health.status = "up" if self._status.running else "idle" if self._status.initialized else "down"
        self._health.availability = 1.0 if await self._dependencies.resilience_policy.is_available(self.connector_id) else 0.0
        return self._health.model_dump(mode="json")

    async def get_status(self) -> dict[str, Any]:
        return self._status.model_dump(mode="json")

    async def get_metadata(self) -> dict[str, Any]:
        return self.metadata.model_dump(mode="json")

    async def get_configuration(self) -> dict[str, Any]:
        return self.configuration.model_dump(mode="json")

    async def get_capabilities(self) -> list[str]:
        return list(self.metadata.capabilities)

    async def discover(self) -> dict[str, Any]:
        return {
            "connector_id": self.connector_id,
            "connector_type": self.metadata.connector_type,
            "capabilities": self.metadata.capabilities,
            "version": self.metadata.version,
        }

    async def _prepare_payload(self, payload: dict[str, Any], *, profile: str) -> dict[str, Any]:
        await self._dependencies.validator.validate(payload)
        started_at = perf_counter()
        transformed = await self._dependencies.transformer.transform(payload, profile=profile)
        latency_ms = round((perf_counter() - started_at) * 1000, 3)
        self._health.latency_ms = latency_ms
        self._metrics.latency_ms = latency_ms
        await self._dependencies.metrics_collector.record_metric(self.connector_id, "latency_ms", latency_ms)
        await self._dependencies.resilience_policy.record_success(self.connector_id)
        return transformed

    async def _record_records(self, *, records: int = 0, messages: int = 0) -> None:
        self._metrics.records += records
        self._metrics.messages += messages
        self._health.last_sync = utc_now()
        await self._dependencies.metrics_collector.increment(self.connector_id, "records", float(records))
        await self._dependencies.metrics_collector.increment(self.connector_id, "messages", float(messages))

    async def _record_failure(self, exc: Exception) -> None:
        self._status.state = ConnectorState.ERROR
        self._status.last_error = str(exc)
        self._health.error_count += 1
        self._metrics.failures += 1
        self._metrics.availability = 0.0
        await self._dependencies.metrics_collector.increment(self.connector_id, "failures")
        await self._dependencies.resilience_policy.record_failure(self.connector_id)
        raise ConnectorLifecycleError(str(exc)) from exc

    async def get_metrics(self) -> ConnectorMetrics:
        return self._metrics

    def _ensure_initialized(self) -> None:
        if not self._status.initialized:
            raise ConnectorLifecycleError(f"Connector '{self.connector_id}' must be initialized before start")


class BaseStreamingConnector(BaseConnector):
    async def stream_messages(self) -> list[dict[str, Any]]:
        raise NotImplementedError


class BasePollingConnector(BaseConnector):
    async def poll(self) -> list[dict[str, Any]]:
        raise NotImplementedError


class BaseFileConnector(BaseConnector):
    async def read_file(self, path: str) -> str:
        raise NotImplementedError

    async def write_file(self, path: str, content: str) -> dict[str, Any]:
        raise NotImplementedError


class BaseApiConnector(BaseConnector):
    async def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        raise NotImplementedError


class BaseDatabaseConnector(BaseConnector):
    async def query(self, statement: str) -> list[dict[str, Any]]:
        raise NotImplementedError


class BaseMessageConnector(BaseStreamingConnector):
    async def publish_message(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError

    async def consume_messages(self) -> list[dict[str, Any]]:
        raise NotImplementedError


class BaseCloudConnector(BaseApiConnector):
    async def invoke(self, payload: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError