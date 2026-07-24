from __future__ import annotations

from datetime import datetime
from typing import Any

from app.memory.exceptions import MemoryRetrievalError
from app.memory.models import MemoryEntry, MemoryQuery
from app.memory.storage import MemoryStore


class MemoryRetriever:
    """Retrieve memory entries with filtering support."""

    def __init__(self, store: MemoryStore | None = None) -> None:
        self.store = store or MemoryStore()

    def query(self, query: MemoryQuery) -> list[MemoryEntry]:
        if query.entity_id is None and query.entity_type is None and query.incident_id is None and query.policy_id is None:
            raise MemoryRetrievalError("At least one retrieval filter is required")

        entries = self.store.list()
        filtered = []
        for entry in entries:
            if query.entity_id and entry.entity_id != query.entity_id:
                continue
            if query.entity_type and entry.entity_type != query.entity_type:
                continue
            if query.incident_id and entry.incident_id != query.incident_id:
                continue
            if query.policy_id and entry.policy_id != query.policy_id:
                continue
            if query.start_time:
                if datetime.fromisoformat(entry.timestamp) < datetime.fromisoformat(query.start_time):
                    continue
            if query.end_time:
                if datetime.fromisoformat(entry.timestamp) > datetime.fromisoformat(query.end_time):
                    continue
            filtered.append(entry)
        return filtered
