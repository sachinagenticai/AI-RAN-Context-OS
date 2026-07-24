from __future__ import annotations

import asyncio

from app.connectors.base.connectors import BaseConnector, ConnectorDependencies
from app.connectors.cache.provider import InMemoryCacheProvider
from app.connectors.events.bus import InMemoryEventBus
from app.connectors.metrics.collector import InMemoryMetricsCollector
from app.connectors.registry.connector_registry import ConnectorRegistry
from app.connectors.resilience.policy import ResiliencePolicy
from app.connectors.schemas.connector_schemas import ConnectorConfiguration, ConnectorMetadata
from app.connectors.transformation.provider import CanonicalTransformationProvider
from app.connectors.utils.helpers import JsonDeserializer, JsonSerializer
from app.connectors.validators.validator import DefaultValidator


class StubConnector(BaseConnector):
    pass


def _dependencies() -> ConnectorDependencies:
    return ConnectorDependencies(
        authentication_provider=object(),
        authorization_provider=object(),
        transformer=CanonicalTransformationProvider(),
        validator=DefaultValidator(),
        cache=InMemoryCacheProvider(),
        retry_strategy=object(),
        event_bus=InMemoryEventBus(),
        metrics_collector=InMemoryMetricsCollector(),
        resilience_policy=ResiliencePolicy(),
        serializer=JsonSerializer(),
        deserializer=JsonDeserializer(),
    )


def _connector(connector_id: str, dependencies: list[str] | None = None) -> StubConnector:
    configuration = ConnectorConfiguration(connector_type="synthetic", name=connector_id, dependencies=dependencies or [])
    metadata = ConnectorMetadata(
        connector_id=connector_id,
        connector_type="synthetic",
        name=connector_id,
        version="1.0.0",
        capabilities=["telemetry"],
        dependencies=dependencies or [],
    )
    return StubConnector(connector_id=connector_id, metadata=metadata, configuration=configuration, dependencies=_dependencies())


def test_registry_registers_and_discovers_connectors() -> None:
    async def scenario() -> None:
        registry = ConnectorRegistry()
        await registry.register(_connector("synthetic-1"))

        connectors = await registry.list_connectors()
        capabilities = await registry.capability_index()

        assert len(connectors) == 1
        assert connectors[0].connector_id == "synthetic-1"
        assert capabilities["synthetic-1"] == ["telemetry"]

    asyncio.run(scenario())


def test_registry_resolves_dependencies_in_order() -> None:
    async def scenario() -> None:
        registry = ConnectorRegistry()
        await registry.register(_connector("base"))
        await registry.register(_connector("dependent", dependencies=["base"]))

        resolved = await registry.resolve_dependencies("dependent")

        assert resolved == ["base", "dependent"]

    asyncio.run(scenario())