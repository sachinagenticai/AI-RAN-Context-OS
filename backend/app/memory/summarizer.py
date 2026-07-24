from __future__ import annotations

from app.memory.models import MemoryEntry, MemorySummary


class MemorySummarizer:
    """Create concise summaries for historical operational behavior."""

    def summarize(self, entries: list[MemoryEntry], entity_id: str, entity_type: str) -> MemorySummary:
        categories = sorted({entry.category.value for entry in entries})
        summary = (
            f"Entity {entity_id} has {len(entries)} memory entries across {', '.join(categories) or 'no categories'} "
            f"with recent operational context captured for {entity_type}."
        )
        return MemorySummary(entity_id=entity_id, entity_type=entity_type, summary=summary, entry_count=len(entries), categories=categories)
