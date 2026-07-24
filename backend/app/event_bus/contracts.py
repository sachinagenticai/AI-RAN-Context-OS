from __future__ import annotations

from typing import Any, Protocol

from app.models.canonical.events.models import CanonicalEvent


class EventSubscriber(Protocol):
    async def on_event(self, event: CanonicalEvent) -> None: ...


class EventPublisher(Protocol):
    async def publish(self, topic: str, event: CanonicalEvent) -> dict[str, Any]: ...


class EventBusPlugin(Protocol):
    async def register(self, bus: Any) -> None: ...