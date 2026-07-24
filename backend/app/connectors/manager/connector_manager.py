from __future__ import annotations

from app.connectors.configuration.provider import InMemoryConfigurationProvider
from app.connectors.discovery.service import ConnectorDiscoveryResponse, ConnectorDiscoveryService
from app.connectors.factory.connector_factory import ConnectorFactory, build_factory_dependencies
from app.connectors.health.service import ConnectorHealthService
from app.connectors.lifecycle.service import ConnectorLifecycleService
from app.connectors.monitoring.service import ConnectorMonitoringService
from app.connectors.plugins.loader import ConnectorPluginLoader
from app.connectors.plugins.mock_connectors import register_plugins
from app.connectors.registry.connector_registry import ConnectorRegistry
from app.connectors.retry.strategy import AsyncRetryStrategy
from app.connectors.schemas.connector_schemas import (
    ConnectorActionRequest,
    ConnectorCapabilityCatalog,
    ConnectorDetail,
    ConnectorDiscoveryResponse,
    ConnectorHealth,
    ConnectorRecord,
    ConnectorRegistrationRequest,
    ConnectorRuntimeStatus,
)


class ConnectorManager:
    def __init__(
        self,
        *,
        registry: ConnectorRegistry,
        factory: ConnectorFactory,
        discovery_service: ConnectorDiscoveryService,
        health_service: ConnectorHealthService,
        lifecycle_service: ConnectorLifecycleService,
        monitoring_service: ConnectorMonitoringService,
        configuration_provider: InMemoryConfigurationProvider,
        plugin_loader: ConnectorPluginLoader,
    ) -> None:
        self._registry = registry
        self._factory = factory
        self._discovery_service = discovery_service
        self._health_service = health_service
        self._lifecycle_service = lifecycle_service
        self._monitoring_service = monitoring_service
        self._configuration_provider = configuration_provider
        self._plugin_loader = plugin_loader

    async def initialize(self) -> None:
        config = await self._configuration_provider.load()
        plugin_modules = list(config.get("plugins", []))
        if plugin_modules:
            await self._plugin_loader.load(self._factory, plugin_modules)

    async def register_connector(self, request: ConnectorRegistrationRequest) -> ConnectorDetail:
        connector = await self._factory.create_from_configuration(request.connector_id, request.configuration)
        await self._registry.register(connector)
        await self._lifecycle_service.initialize(connector)
        if request.auto_start:
            await self._lifecycle_service.start(connector)
        return await self.get_connector(request.connector_id)

    async def list_connectors(self) -> list[ConnectorRecord]:
        connectors = await self._registry.list_connectors()
        records: list[ConnectorRecord] = []
        for connector in connectors:
            records.append(
                ConnectorRecord(
                    metadata=connector.metadata,
                    configuration=connector.configuration,
                    status=ConnectorRuntimeStatus(**await connector.get_status()),
                )
            )
        return records

    async def get_connector(self, connector_id: str) -> ConnectorDetail:
        connector = await self._registry.get(connector_id)
        return ConnectorDetail(
            metadata=connector.metadata,
            configuration=connector.configuration,
            status=ConnectorRuntimeStatus(**await connector.get_status()),
            health=ConnectorHealth(**await connector.health_check()),
            metrics=await connector.get_metrics(),
        )

    async def start_connector(self, request: ConnectorActionRequest) -> ConnectorRuntimeStatus:
        connector = await self._registry.get(request.connector_id)
        return ConnectorRuntimeStatus(**await self._lifecycle_service.start(connector))

    async def stop_connector(self, request: ConnectorActionRequest) -> ConnectorRuntimeStatus:
        connector = await self._registry.get(request.connector_id)
        return ConnectorRuntimeStatus(**await self._lifecycle_service.stop(connector))

    async def restart_connector(self, request: ConnectorActionRequest) -> ConnectorRuntimeStatus:
        connector = await self._registry.get(request.connector_id)
        return ConnectorRuntimeStatus(**await self._lifecycle_service.restart(connector))

    async def reconnect_connector(self, request: ConnectorActionRequest) -> ConnectorRuntimeStatus:
        connector = await self._registry.get(request.connector_id)
        return ConnectorRuntimeStatus(**await self._lifecycle_service.reconnect(connector))

    async def heartbeat(self, connector_id: str) -> dict[str, object]:
        connector = await self._registry.get(connector_id)
        return await self._lifecycle_service.heartbeat(connector)

    async def statuses(self, connector_id: str | None = None) -> list[ConnectorRuntimeStatus]:
        connectors = [await self._registry.get(connector_id)] if connector_id else await self._registry.list_connectors()
        return [ConnectorRuntimeStatus(**await connector.get_status()) for connector in connectors]

    async def health(self, connector_id: str | None = None) -> list[ConnectorHealth]:
        return await self._health_service.collect(connector_id)

    async def discover(self) -> ConnectorDiscoveryResponse:
        return await self._discovery_service.discover()

    async def capabilities(self) -> ConnectorCapabilityCatalog:
        return ConnectorCapabilityCatalog(
            connectors=await self._registry.capability_index(),
            available_types=await self._factory.capabilities(),
        )

    async def monitoring(self) -> dict[str, int]:
        return await self._monitoring_service.summarize(await self.statuses())


def build_connector_manager() -> ConnectorManager:
    retry_strategy = AsyncRetryStrategy()
    dependencies = build_factory_dependencies(retry_strategy)
    registry = ConnectorRegistry()
    factory = ConnectorFactory(dependencies=dependencies)
    register_plugins(factory)
    discovery_service = ConnectorDiscoveryService(registry=registry, factory=factory, transformer=dependencies.transformer)
    health_service = ConnectorHealthService(registry)
    lifecycle_service = ConnectorLifecycleService()
    monitoring_service = ConnectorMonitoringService()
    configuration_provider = InMemoryConfigurationProvider()
    plugin_loader = ConnectorPluginLoader()
    return ConnectorManager(
        registry=registry,
        factory=factory,
        discovery_service=discovery_service,
        health_service=health_service,
        lifecycle_service=lifecycle_service,
        monitoring_service=monitoring_service,
        configuration_provider=configuration_provider,
        plugin_loader=plugin_loader,
    )