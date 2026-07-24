from __future__ import annotations

from typing import Any

from app.connectors.exceptions.connector_exceptions import ConnectorNotFoundError, ConnectorRegistrationError


class ConnectorRegistry:
    def __init__(self) -> None:
        self._connectors: dict[str, Any] = {}
        self._versions: dict[str, str] = {}

    async def register(self, connector: Any) -> None:
        connector_id = connector.connector_id
        if connector_id in self._connectors:
            raise ConnectorRegistrationError(f"Connector '{connector_id}' is already registered")
        self._connectors[connector_id] = connector
        self._versions[connector_id] = connector.metadata.version

    async def get(self, connector_id: str) -> Any:
        if connector_id not in self._connectors:
            raise ConnectorNotFoundError(f"Connector '{connector_id}' was not found")
        return self._connectors[connector_id]

    async def list_connectors(self) -> list[Any]:
        return [self._connectors[key] for key in sorted(self._connectors)]

    async def discover(self, connector_type: str | None = None) -> list[Any]:
        connectors = await self.list_connectors()
        if connector_type is None:
            return connectors
        return [connector for connector in connectors if connector.metadata.connector_type == connector_type]

    async def lookup_by_capability(self, capability: str) -> list[str]:
        connectors = await self.list_connectors()
        return [connector.connector_id for connector in connectors if capability in connector.metadata.capabilities]

    async def capability_index(self) -> dict[str, list[str]]:
        connectors = await self.list_connectors()
        return {connector.connector_id: list(connector.metadata.capabilities) for connector in connectors}

    async def versions(self) -> dict[str, str]:
        return dict(self._versions)

    async def resolve_dependencies(self, connector_id: str) -> list[str]:
        resolved: list[str] = []
        visiting: set[str] = set()
        visited: set[str] = set()

        async def visit(current_id: str) -> None:
            if current_id in visited:
                return
            if current_id in visiting:
                raise ConnectorRegistrationError(f"Circular dependency detected for connector '{current_id}'")
            connector = await self.get(current_id)
            visiting.add(current_id)
            for dependency in connector.metadata.dependencies:
                await visit(dependency)
            visiting.remove(current_id)
            visited.add(current_id)
            resolved.append(current_id)

        await visit(connector_id)
        return resolved