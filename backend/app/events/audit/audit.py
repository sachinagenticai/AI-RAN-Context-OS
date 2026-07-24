from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class AuditEntry:
    event_id: str
    event_type: str
    topic: str
    status: str
    timestamp: str


class EventAuditLog:
    def __init__(self) -> None:
        self._entries: list[AuditEntry] = []

    async def record(self, entry: AuditEntry) -> None:
        self._entries.append(entry)

    async def list(self) -> list[AuditEntry]:
        return list(self._entries)
