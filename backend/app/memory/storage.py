from __future__ import annotations

from typing import Any

from app.memory.exceptions import MemoryStorageError
from app.memory.models import MemoryCategory, MemoryEntry


class MemoryStore:
    """Abstract-like storage interface for memory entries."""

    def __init__(self) -> None:
        self._entries: list[MemoryEntry] = []

    def store(self, entry: MemoryEntry) -> MemoryEntry:
        self._entries.append(entry)
        return entry

    def list(self) -> list[MemoryEntry]:
        return list(self._entries)

    def get_by_entity(self, entity_id: str) -> list[MemoryEntry]:
        return [entry for entry in self._entries if entry.entity_id == entity_id]

    def clear(self) -> None:
        self._entries.clear()
