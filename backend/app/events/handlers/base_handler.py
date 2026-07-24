from __future__ import annotations

from abc import ABC, abstractmethod

from app.events.models.event import Event


class BaseEventHandler(ABC):
    @abstractmethod
    async def handle(self, event: Event) -> None:
        raise NotImplementedError
