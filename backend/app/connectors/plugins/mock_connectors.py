from __future__ import annotations

import csv
from io import StringIO
from typing import Any

from app.connectors.adapters.openai_connector import OpenAIConnectorWrapper, build_openai_service
from app.connectors.base.connectors import (
    BaseApiConnector,
    BaseFileConnector,
    BaseMessageConnector,
    BasePollingConnector,
    BaseStreamingConnector,
    ConnectorDependencies,
)
from app.connectors.factory.connector_factory import ConnectorFactory, FactoryDependencies, build_metadata
from app.connectors.polling.service import PollingFramework
from app.connectors.schemas.connector_schemas import ConnectorConfiguration, ConnectorTypeDescriptor
from app.connectors.streaming.service import StreamingFramework
from app.connectors.utils.helpers import utc_now


def _build_connector_dependencies(dependencies: FactoryDependencies, configuration: ConnectorConfiguration) -> ConnectorDependencies:
    auth_provider = dependencies.authentication_providers.get(configuration.auth_type, dependencies.authentication_providers["none"])
    return ConnectorDependencies(
        authentication_provider=auth_provider,
        authorization_provider=dependencies.authorization_provider,
        transformer=dependencies.transformer,
        validator=dependencies.validator,
        cache=dependencies.cache,
        retry_strategy=dependencies.retry_strategy,
        event_bus=dependencies.event_bus,
        metrics_collector=dependencies.metrics_collector,
        resilience_policy=dependencies.resilience_policy,
        serializer=dependencies.serializer,
        deserializer=dependencies.deserializer,
    )


class SyntheticConnector(BasePollingConnector):
    def __init__(self, *, polling_framework: PollingFramework, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._polling_framework = polling_framework

    async def poll(self) -> list[dict[str, Any]]:
        sample = {
            "id": self.connector_id,
            "record_type": "telemetry",
            "vendor": "Synthetic",
            "kpi": "availability",
            "value": 99.95,
            "timestamp": utc_now(),
        }
        record = await self._prepare_payload(sample, profile="Synthetic")
        await self._polling_framework.update_checkpoint(self.connector_id, record["timestamp"])
        await self._record_records(records=1)
        return [record]

    async def pull_telemetry(self) -> list[dict[str, Any]]:
        return await self.poll()

    async def sync_inventory(self) -> list[dict[str, Any]]:
        sample = {"id": self.connector_id, "record_type": "inventory", "vendor": "Synthetic", "technology": "5G"}
        record = await self._prepare_payload(sample, profile="Synthetic")
        await self._record_records(records=1)
        return [record]


class RestConnector(BaseApiConnector):
    async def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        body = payload or {"id": self.connector_id, "record_type": "api", "source": "rest"}
        prepared = await self._prepare_payload(body, profile="Synthetic")
        await self._record_records(records=1, messages=1)
        return {"method": method.upper(), "path": path, "headers": await self._dependencies.authentication_provider.authenticate(self.configuration.settings), "data": prepared, "canonical": True}


class WebhookConnector(BaseStreamingConnector):
    def __init__(self, *, streaming_framework: StreamingFramework, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._streaming_framework = streaming_framework

    async def emit_event(self, payload: dict[str, Any]) -> dict[str, Any]:
        prepared = await self._prepare_payload(payload, profile="Synthetic")
        await self._dependencies.event_bus.publish_event("webhook.events", prepared)
        await self._record_records(records=1, messages=1)
        return {"accepted": True, "event": prepared, "canonical": True}

    async def stream_messages(self) -> list[dict[str, Any]]:
        messages = await self._dependencies.event_bus.consume_events("webhook.events")
        await self._record_records(messages=len(messages))
        return await self._streaming_framework.wrap_messages("webhook.events", messages)


class CsvConnector(BaseFileConnector):
    async def read_file(self, path: str) -> str:
        return str(await self._dependencies.cache.get(path) or self.configuration.settings.get("content", "id,record_type,vendor\n1,inventory,Synthetic"))

    async def write_file(self, path: str, content: str) -> dict[str, Any]:
        await self._dependencies.cache.set(path, content)
        return {"path": path, "written": True}

    async def read_records(self, path: str) -> list[dict[str, Any]]:
        content = await self.read_file(path)
        rows = list(csv.DictReader(StringIO(content)))
        records = [await self._prepare_payload(dict(row), profile="Synthetic") for row in rows]
        await self._record_records(records=len(records))
        return records


class FileConnector(BaseFileConnector):
    async def read_file(self, path: str) -> str:
        return str(await self._dependencies.cache.get(path) or self.configuration.settings.get("default_content", "mock-file-content"))

    async def write_file(self, path: str, content: str) -> dict[str, Any]:
        await self._dependencies.cache.set(path, content)
        await self._record_records(records=1)
        return {"path": path, "content_length": len(content)}


class KafkaMockConnector(BaseMessageConnector):
    def __init__(self, *, streaming_framework: StreamingFramework, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._streaming_framework = streaming_framework

    async def publish_message(self, payload: dict[str, Any]) -> dict[str, Any]:
        prepared = await self._prepare_payload(payload, profile="Synthetic")
        await self._dependencies.event_bus.publish_event("kafka.messages", prepared)
        await self._record_records(messages=1)
        return {"published": True, "message": prepared, "canonical": True}

    async def consume_messages(self) -> list[dict[str, Any]]:
        messages = await self._dependencies.event_bus.consume_events("kafka.messages")
        return await self._streaming_framework.wrap_messages("kafka.messages", messages)

    async def stream_messages(self) -> list[dict[str, Any]]:
        messages = await self.consume_messages()
        await self._record_records(messages=len(messages))
        return messages


async def _build_synthetic(connector_id: str, configuration: ConnectorConfiguration, dependencies: FactoryDependencies) -> SyntheticConnector:
    return SyntheticConnector(
        connector_id=connector_id,
        metadata=build_metadata(connector_id, configuration, ["telemetry", "inventory", "polling"]),
        configuration=configuration,
        dependencies=_build_connector_dependencies(dependencies, configuration),
        polling_framework=PollingFramework(),
    )


async def _build_rest(connector_id: str, configuration: ConnectorConfiguration, dependencies: FactoryDependencies) -> RestConnector:
    return RestConnector(
        connector_id=connector_id,
        metadata=build_metadata(connector_id, configuration, ["api", "request-response"]),
        configuration=configuration,
        dependencies=_build_connector_dependencies(dependencies, configuration),
    )


async def _build_webhook(connector_id: str, configuration: ConnectorConfiguration, dependencies: FactoryDependencies) -> WebhookConnector:
    return WebhookConnector(
        connector_id=connector_id,
        metadata=build_metadata(connector_id, configuration, ["events", "streaming", "webhook"]),
        configuration=configuration,
        dependencies=_build_connector_dependencies(dependencies, configuration),
        streaming_framework=StreamingFramework(),
    )


async def _build_csv(connector_id: str, configuration: ConnectorConfiguration, dependencies: FactoryDependencies) -> CsvConnector:
    return CsvConnector(
        connector_id=connector_id,
        metadata=build_metadata(connector_id, configuration, ["file", "csv", "batch"]),
        configuration=configuration,
        dependencies=_build_connector_dependencies(dependencies, configuration),
    )


async def _build_file(connector_id: str, configuration: ConnectorConfiguration, dependencies: FactoryDependencies) -> FileConnector:
    return FileConnector(
        connector_id=connector_id,
        metadata=build_metadata(connector_id, configuration, ["file", "storage"]),
        configuration=configuration,
        dependencies=_build_connector_dependencies(dependencies, configuration),
    )


async def _build_kafka_mock(connector_id: str, configuration: ConnectorConfiguration, dependencies: FactoryDependencies) -> KafkaMockConnector:
    return KafkaMockConnector(
        connector_id=connector_id,
        metadata=build_metadata(connector_id, configuration, ["message", "streaming", "kafka"]),
        configuration=configuration,
        dependencies=_build_connector_dependencies(dependencies, configuration),
        streaming_framework=StreamingFramework(),
    )


async def _build_openai_wrapper(connector_id: str, configuration: ConnectorConfiguration, dependencies: FactoryDependencies) -> OpenAIConnectorWrapper:
    return OpenAIConnectorWrapper(
        connector_id=connector_id,
        metadata=build_metadata(connector_id, configuration, ["cloud", "llm", "api"]),
        configuration=configuration,
        dependencies=_build_connector_dependencies(dependencies, configuration),
        openai_service=build_openai_service(),
    )


def register_plugins(factory: ConnectorFactory) -> None:
    descriptors = {
        "synthetic": ConnectorTypeDescriptor(connector_type="synthetic", capabilities=["telemetry", "inventory", "polling"], description="Mock synthetic telecom connector", transport="polling"),
        "rest": ConnectorTypeDescriptor(connector_type="rest", capabilities=["api", "request-response"], description="Mock REST connector", transport="http"),
        "webhook": ConnectorTypeDescriptor(connector_type="webhook", capabilities=["events", "streaming", "webhook"], description="Mock webhook connector", transport="webhook"),
        "csv": ConnectorTypeDescriptor(connector_type="csv", capabilities=["file", "csv", "batch"], description="Mock CSV connector", transport="file"),
        "file": ConnectorTypeDescriptor(connector_type="file", capabilities=["file", "storage"], description="Mock file connector", transport="file"),
        "kafka_mock": ConnectorTypeDescriptor(connector_type="kafka_mock", capabilities=["message", "streaming", "kafka"], description="Mock Kafka-style connector", transport="streaming"),
        "openai_wrapper": ConnectorTypeDescriptor(connector_type="openai_wrapper", capabilities=["cloud", "llm", "api"], description="Mock OpenAI wrapper connector", transport="cloud"),
    }
    factory._register_builder("synthetic", _build_synthetic, descriptors["synthetic"])
    factory._register_builder("rest", _build_rest, descriptors["rest"])
    factory._register_builder("webhook", _build_webhook, descriptors["webhook"])
    factory._register_builder("csv", _build_csv, descriptors["csv"])
    factory._register_builder("file", _build_file, descriptors["file"])
    factory._register_builder("kafka_mock", _build_kafka_mock, descriptors["kafka_mock"])
    factory._register_builder("openai_wrapper", _build_openai_wrapper, descriptors["openai_wrapper"])