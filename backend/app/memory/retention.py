from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from app.memory.models import MemoryEntry


class RetentionPolicy:
    """Simple configurable retention policy for memory entries."""

    def __init__(self, days: int = 90, archive_after_days: int = 30) -> None:
        self.days = days
        self.archive_after_days = archive_after_days

    def apply(self, entries: list[MemoryEntry]) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc)
        results: list[dict[str, Any]] = []
        for entry in entries:
            created = datetime.fromisoformat(entry.timestamp)
            age_days = (now - created).days
            if age_days > self.days:
                results.append({"entry_id": entry.id, "action": "delete"})
            elif age_days > self.archive_after_days:
                results.append({"entry_id": entry.id, "action": "archive"})
            else:
                results.append({"entry_id": entry.id, "action": "retain"})
        return results
