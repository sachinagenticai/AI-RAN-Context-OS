from __future__ import annotations

import asyncio

from app.connectors.factory.connector_factory import ConnectorFactory, build_factory_dependencies
from app.connectors.plugins.mock_connectors import register_plugins
from app.connectors.retry.strategy import AsyncRetryStrategy
from app.connectors.schemas.connector_schemas import ConnectorConfiguration


def test_factory_creates_mock_connector_from_configuration() -> None:
    async def scenario() -> None:
        factory = ConnectorFactory(dependencies=build_factory_dependencies(AsyncRetryStrategy()))
        register_plugins(factory)

        connector = await factory.create_from_configuration(
            "rest-1",
            ConnectorConfiguration(connector_type="rest", name="REST Connector"),
        )

        assert connector.metadata.connector_type == "rest"
        assert "api" in connector.metadata.capabilities

    asyncio.run(scenario())


def test_factory_discovers_registered_connector_types() -> None:
    async def scenario() -> None:
        factory = ConnectorFactory(dependencies=build_factory_dependencies(AsyncRetryStrategy()))
        register_plugins(factory)

        discovered = await factory.discover_types()

        assert {item.connector_type for item in discovered} >= {"synthetic", "rest", "webhook", "csv", "file", "kafka_mock", "openai_wrapper"}

    asyncio.run(scenario())