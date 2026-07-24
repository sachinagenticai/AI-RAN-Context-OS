from __future__ import annotations

from typing import Protocol

from app.events.models.event import Event


class EventDispatcher(Protocol):
    async def dispatch(self, event: Event) -> None: ...
