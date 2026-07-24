from __future__ import annotations

from typing import Protocol

from app.events.models.event import Event


class EventSubscriber(Protocol):
    async def handle(self, event: Event) -> None: ...
