from __future__ import annotations

from typing import Any

from app.memory.exceptions import MemoryStorageError
from app.memory.models import MemoryCategory, MemoryEntry, MemoryQuery, MemorySummary
from app.memory.retrieval import MemoryRetriever
from app.memory.retention import RetentionPolicy
from app.memory.storage import MemoryStore
from app.memory.summarizer import MemorySummarizer


class MemoryService:
    """Service orchestrating memory storage, retrieval, summarization, and retention."""

    def __init__(self, store: MemoryStore | None = None, retriever: MemoryRetriever | None = None, summarizer: MemorySummarizer | None = None, retention_policy: RetentionPolicy | None = None) -> None:
        self.store = store or MemoryStore()
        self.retriever = retriever or MemoryRetriever(self.store)
        self.summarizer = summarizer or MemorySummarizer()
        self.retention_policy = retention_policy or RetentionPolicy()

    def store_entry(self, entry: MemoryEntry) -> MemoryEntry:
        return self.store.store(entry)

    def list_entries(self) -> list[MemoryEntry]:
        return self.store.list()

    def get_by_entity(self, entity_id: str) -> list[MemoryEntry]:
        return self.store.get_by_entity(entity_id)

    def query(self, query: MemoryQuery) -> list[MemoryEntry]:
        return self.retriever.query(query)

    def summarize(self, entity_id: str, entity_type: str) -> MemorySummary:
        entries = self.get_by_entity(entity_id)
        return self.summarizer.summarize(entries, entity_id, entity_type)

    def apply_retention(self) -> list[dict[str, Any]]:
        return self.retention_policy.apply(self.store.list())
