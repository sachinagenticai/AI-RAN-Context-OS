from __future__ import annotations

import asyncio

from app.connectors.factory.connector_factory import ConnectorFactory, build_factory_dependencies
from app.connectors.plugins.mock_connectors import register_plugins
from app.connectors.retry.strategy import AsyncRetryStrategy
from app.connectors.schemas.connector_schemas import ConnectorConfiguration


def test_synthetic_and_kafka_mock_connectors_produce_async_payloads() -> None:
    async def scenario() -> None:
        factory = ConnectorFactory(dependencies=build_factory_dependencies(AsyncRetryStrategy()))
        register_plugins(factory)

        synthetic = await factory.create_from_configuration("synthetic-telemetry", ConnectorConfiguration(connector_type="synthetic", name="Synthetic"))
        kafka = await factory.create_from_configuration("kafka-stream", ConnectorConfiguration(connector_type="kafka_mock", name="Kafka Mock"))
        await synthetic.initialize()
        await synthetic.start()
        await kafka.initialize()
        await kafka.start()

        telemetry = await synthetic.pull_telemetry()
        published = await kafka.publish_message({"id": "msg-1", "record_type": "alarm", "severity": "Major"})
        streamed = await kafka.stream_messages()

        assert telemetry[0]["metadata"]["source_profile"] == "Synthetic"
        assert published["published"] is True
        assert streamed[0]["topic"] == "kafka.messages"

    asyncio.run(scenario())


def test_csv_and_openai_wrapper_connectors_return_mock_outputs() -> None:
    async def scenario() -> None:
        factory = ConnectorFactory(dependencies=build_factory_dependencies(AsyncRetryStrategy()))
        register_plugins(factory)

        csv_connector = await factory.create_from_configuration(
            "csv-1",
            ConnectorConfiguration(
                connector_type="csv",
                name="CSV Connector",
                settings={"content": "id,record_type,vendor\n1,inventory,Synthetic"},
            ),
        )
        openai_connector = await factory.create_from_configuration("openai-1", ConnectorConfiguration(connector_type="openai_wrapper", name="OpenAI Wrapper"))
        await csv_connector.initialize()
        await csv_connector.start()
        await openai_connector.initialize()
        await openai_connector.start()

        rows = await csv_connector.read_records("inventory.csv")
        response = await openai_connector.invoke({"id": "site-1", "record_type": "summary", "context": "site health degraded"})

        assert rows[0]["entity_type"] == "canonical_node"
        assert rows[0]["labels"]["record_type"] == "inventory"
        assert response["result"]["status"] in {"mocked", "ok"}

    asyncio.run(scenario())