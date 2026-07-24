from __future__ import annotations

from app.connectors.exceptions.connector_exceptions import ConnectorLifecycleError


class ConnectorLifecycleService:
    async def initialize(self, connector: object) -> dict[str, object]:
        return await connector.initialize()

    async def start(self, connector: object) -> dict[str, object]:
        return await connector.start()

    async def stop(self, connector: object) -> dict[str, object]:
        return await connector.stop()

    async def restart(self, connector: object) -> dict[str, object]:
        return await connector.restart()

    async def reconnect(self, connector: object) -> dict[str, object]:
        try:
            return await connector.reconnect()
        except Exception as exc:
            raise ConnectorLifecycleError(str(exc)) from exc

    async def heartbeat(self, connector: object) -> dict[str, object]:
        return await connector.heartbeat()