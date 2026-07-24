from __future__ import annotations

from collections import defaultdict
from typing import Any


class InMemoryEventBus:
    def __init__(self) -> None:
        self._topics: dict[str, list[dict[str, Any]]] = defaultdict(list)

    async def publish_event(self, topic: str, payload: dict[str, Any]) -> None:
        self._topics[topic].append(payload)

    async def consume_events(self, topic: str) -> list[dict[str, Any]]:
        return list(self._topics.get(topic, []))