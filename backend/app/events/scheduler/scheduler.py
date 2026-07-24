from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class ScheduledEvent:
    topic: str
    payload: dict[str, Any]
    run_at: str


class EventScheduler:
    def __init__(self) -> None:
        self._scheduled: list[ScheduledEvent] = []

    async def schedule(self, event: ScheduledEvent) -> None:
        self._scheduled.append(event)

    async def list(self) -> list[ScheduledEvent]:
        return list(self._scheduled)
