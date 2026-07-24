from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class DeadLetterEntry:
    event_id: str
    event_type: str
    topic: str
    reason: str
    payload: dict[str, Any]


class DeadLetterQueue:
    def __init__(self) -> None:
        self._entries: list[DeadLetterEntry] = []

    async def push(self, entry: DeadLetterEntry) -> None:
        self._entries.append(entry)

    async def list(self) -> list[DeadLetterEntry]:
        return list(self._entries)
