from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.events.models.event import Event


class EventStore:
    def __init__(self) -> None:
        self._events: list[Event] = []
        self._topics: dict[str, list[Event]] = defaultdict(list)

    async def append(self, topic: str, event: Event) -> None:
        self._events.append(event)
        self._topics[topic].append(event)

    async def list_all(self) -> list[Event]:
        return list(self._events)

    async def list_topic(self, topic: str) -> list[Event]:
        return list(self._topics.get(topic, []))

    async def topics(self) -> list[str]:
        return sorted(self._topics)
