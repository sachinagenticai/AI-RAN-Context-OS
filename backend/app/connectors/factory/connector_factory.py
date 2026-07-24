from __future__ import annotations

import importlib
import inspect
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from app.connectors.authentication.providers import build_authentication_providers
from app.connectors.authorization.providers import DefaultAuthorizationProvider
from app.connectors.cache.provider import InMemoryCacheProvider
from app.connectors.events.bus import InMemoryEventBus
from app.connectors.exceptions.connector_exceptions import ConnectorConfigurationError, ConnectorPluginError
from app.connectors.metrics.collector import InMemoryMetricsCollector
from app.connectors.resilience.policy import ResiliencePolicy
from app.connectors.schemas.connector_schemas import ConnectorConfiguration, ConnectorMetadata, ConnectorTypeDescriptor
from app.connectors.transformation.provider import CanonicalTransformationProvider
from app.connectors.utils.helpers import JsonDeserializer, JsonSerializer
from app.connectors.validators.validator import DefaultValidator


@dataclass(slots=True)
class FactoryDependencies:
    authentication_providers: dict[str, object]
    authorization_provider: DefaultAuthorizationProvider
    transformer: CanonicalTransformationProvider
    validator: DefaultValidator
    cache: InMemoryCacheProvider
    retry_strategy: object
    event_bus: InMemoryEventBus
    metrics_collector: InMemoryMetricsCollector
    resilience_policy: ResiliencePolicy
    serializer: JsonSerializer
    deserializer: JsonDeserializer


ConnectorBuilder = Callable[[str, ConnectorConfiguration, FactoryDependencies], Awaitable[Any]]


class ConnectorFactory:
    def __init__(self, *, dependencies: FactoryDependencies) -> None:
        self._dependencies = dependencies
        self._builders: dict[str, ConnectorBuilder] = {}
        self._descriptors: dict[str, ConnectorTypeDescriptor] = {}

    async def register_builder(self, connector_type: str, builder: ConnectorBuilder, descriptor: ConnectorTypeDescriptor) -> None:
        self._register_builder(connector_type, builder, descriptor)

    def _register_builder(self, connector_type: str, builder: ConnectorBuilder, descriptor: ConnectorTypeDescriptor) -> None:
        self._builders[connector_type] = builder
        self._descriptors[connector_type] = descriptor

    async def create_by_type(self, connector_type: str, connector_id: str, configuration: ConnectorConfiguration) -> Any:
        builder = self._builders.get(connector_type)
        if builder is None:
            raise ConnectorConfigurationError(f"Connector type '{connector_type}' is not registered")
        return await builder(connector_id, configuration, self._dependencies)

    async def create_from_configuration(self, connector_id: str, configuration: ConnectorConfiguration) -> Any:
        return await self.create_by_type(configuration.connector_type, connector_id, configuration)

    async def discover_types(self) -> list[ConnectorTypeDescriptor]:
        return [self._descriptors[key] for key in sorted(self._descriptors)]

    async def capabilities(self) -> dict[str, list[str]]:
        return {name: list(descriptor.capabilities) for name, descriptor in sorted(self._descriptors.items())}

    async def load_plugin(self, module_path: str) -> None:
        try:
            module = importlib.import_module(module_path)
            registrar = getattr(module, "register_plugins")
            result = registrar(self)
            if inspect.isawaitable(result):
                await result
        except Exception as exc:
            raise ConnectorPluginError(str(exc)) from exc


def build_factory_dependencies(retry_strategy: object) -> FactoryDependencies:
    return FactoryDependencies(
        authentication_providers=build_authentication_providers(),
        authorization_provider=DefaultAuthorizationProvider(),
        transformer=CanonicalTransformationProvider(),
        validator=DefaultValidator(),
        cache=InMemoryCacheProvider(),
        retry_strategy=retry_strategy,
        event_bus=InMemoryEventBus(),
        metrics_collector=InMemoryMetricsCollector(),
        resilience_policy=ResiliencePolicy(),
        serializer=JsonSerializer(),
        deserializer=JsonDeserializer(),
    )


def build_metadata(connector_id: str, configuration: ConnectorConfiguration, default_capabilities: list[str]) -> ConnectorMetadata:
    capabilities = configuration.capabilities or default_capabilities
    return ConnectorMetadata(
        connector_id=connector_id,
        connector_type=configuration.connector_type,
        name=configuration.name,
        version=configuration.version,
        description=configuration.description,
        capabilities=capabilities,
        dependencies=configuration.dependencies,
        tags=configuration.tags,
    )