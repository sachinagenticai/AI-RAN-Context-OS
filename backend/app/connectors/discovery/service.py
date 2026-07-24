from __future__ import annotations

from app.connectors.factory.connector_factory import ConnectorFactory
from app.connectors.registry.connector_registry import ConnectorRegistry
from app.connectors.schemas.connector_schemas import ConnectorDiscoveryResponse
from app.connectors.transformation.provider import CanonicalTransformationProvider


class ConnectorDiscoveryService:
    def __init__(self, *, registry: ConnectorRegistry, factory: ConnectorFactory, transformer: CanonicalTransformationProvider) -> None:
        self._registry = registry
        self._factory = factory
        self._transformer = transformer

    async def discover(self) -> ConnectorDiscoveryResponse:
        profiles = await self._transformer.get_profiles()
        available_connectors = await self._factory.discover_types()
        registered = [connector.connector_id for connector in await self._registry.list_connectors()]
        return ConnectorDiscoveryResponse(
            registered_connectors=registered,
            available_connectors=available_connectors,
            transformation_profiles=profiles,
        )