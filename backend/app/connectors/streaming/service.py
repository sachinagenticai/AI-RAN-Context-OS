from __future__ import annotations

from typing import Any


class StreamingFramework:
    def __init__(self) -> None:
        self._protocols = ["Kafka", "MQTT", "RabbitMQ", "Azure Event Hub", "AMQP", "WebSocket", "Server Sent Events"]

    async def supported_protocols(self) -> list[str]:
        return list(self._protocols)

    async def wrap_messages(self, topic: str, messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [{"topic": topic, "payload": message} for message in messages]