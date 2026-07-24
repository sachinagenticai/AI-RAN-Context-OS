import asyncio

from app.connectors.factory.connector_factory import ConnectorFactory, build_factory_dependencies
from app.connectors.plugins.mock_connectors import register_plugins
from app.connectors.retry.strategy import AsyncRetryStrategy
from app.connectors.schemas.connector_schemas import ConnectorConfiguration


def test_connectors_return_canonical_entities_only() -> None:
    async def scenario() -> None:
        factory = ConnectorFactory(dependencies=build_factory_dependencies(AsyncRetryStrategy()))
        register_plugins(factory)
        connector = await factory.create_from_configuration("synthetic-cedm", ConnectorConfiguration(connector_type="synthetic", name="Synthetic CEDM"))
        await connector.initialize()
        await connector.start()

        telemetry = await connector.pull_telemetry()

        assert telemetry[0]["entity_type"] == "canonical_telemetry"
        assert telemetry[0]["vendor"] == "Synthetic"
        assert "raw_payload" in telemetry[0]["metadata"]
        assert telemetry[0]["metadata"]["source_profile"] == "Synthetic"

    asyncio.run(scenario())