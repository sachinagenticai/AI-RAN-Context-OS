from __future__ import annotations

from typing import Protocol

from app.events.models.event import Event


class EventPublisher(Protocol):
    async def publish(self, event: Event) -> Event: ...
