from __future__ import annotations

from app.connectors.registry.connector_registry import ConnectorRegistry
from app.connectors.schemas.connector_schemas import ConnectorHealth


class ConnectorHealthService:
    def __init__(self, registry: ConnectorRegistry) -> None:
        self._registry = registry

    async def collect(self, connector_id: str | None = None) -> list[ConnectorHealth]:
        connectors = [await self._registry.get(connector_id)] if connector_id else await self._registry.list_connectors()
        health: list[ConnectorHealth] = []
        for connector in connectors:
            payload = await connector.health_check()
            health.append(ConnectorHealth(**payload))
        return health