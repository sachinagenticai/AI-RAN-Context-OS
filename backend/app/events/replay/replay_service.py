from __future__ import annotations

from app.events.persistence.event_store import EventStore


class EventReplayService:
    def __init__(self, store: EventStore) -> None:
        self._store = store

    async def replay(self, topic: str, limit: int) -> list[dict[str, object]]:
        events = await self._store.list_topic(topic)
        return [event.model_dump(mode="json") for event in events[:limit]]
