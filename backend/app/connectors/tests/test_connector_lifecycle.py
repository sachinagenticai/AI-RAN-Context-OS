from __future__ import annotations

import asyncio

from app.connectors.manager.connector_manager import build_connector_manager
from app.connectors.schemas.connector_schemas import ConnectorActionRequest, ConnectorConfiguration, ConnectorRegistrationRequest, ConnectorState


def test_manager_registers_starts_stops_and_restarts_connector() -> None:
    async def scenario() -> None:
        manager = build_connector_manager()
        await manager.register_connector(
            ConnectorRegistrationRequest(
                connector_id="synthetic-lifecycle",
                configuration=ConnectorConfiguration(connector_type="synthetic", name="Synthetic Lifecycle"),
            )
        )

        started = await manager.start_connector(ConnectorActionRequest(connector_id="synthetic-lifecycle"))
        stopped = await manager.stop_connector(ConnectorActionRequest(connector_id="synthetic-lifecycle"))
        restarted = await manager.restart_connector(ConnectorActionRequest(connector_id="synthetic-lifecycle"))

        assert started.state == ConnectorState.RUNNING
        assert stopped.state == ConnectorState.STOPPED
        assert restarted.state == ConnectorState.RUNNING
        assert restarted.restart_count == 1

    asyncio.run(scenario())