from __future__ import annotations

from typing import Any

from app.events.models.event import Event
from app.events.routing.matcher import EventMatcher


class EventRouter:
    def __init__(self, matcher: EventMatcher | None = None) -> None:
        self._matcher = matcher or EventMatcher()
        self._routes: dict[str, list[Any]] = {}

    async def register(self, topic: str, handler: Any) -> None:
        self._routes.setdefault(topic, []).append(handler)

    async def unregister(self, topic: str, handler: Any) -> None:
        handlers = self._routes.get(topic, [])
        self._routes[topic] = [item for item in handlers if item != handler]

    async def resolve(self, event: Event) -> list[Any]:
        handlers: list[Any] = []
        event_name = getattr(event.event_type, "value", str(event.event_type))
        for topic, topic_handlers in self._routes.items():
            if await self._matcher.matches(topic, event_name):
                handlers.extend(topic_handlers)
        return handlers
