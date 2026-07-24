from __future__ import annotations

from app.event_bus.metrics import EventBusMetricsCollector
from app.event_bus.registry import EventBusRegistry
from app.event_bus.schemas import EventBusStatusResponse


class EventBusHealthMonitor:
    def __init__(self, *, registry: EventBusRegistry, metrics: EventBusMetricsCollector, lifecycle: object) -> None:
        self._registry = registry
        self._metrics = metrics
        self._lifecycle = lifecycle

    async def health(self, plugin_count: int = 0) -> EventBusStatusResponse:
        topics = await self._registry.list_topics()
        subscriptions = await self._registry.total_subscriptions()
        events = await self._registry.total_events()
        status = "running" if getattr(self._lifecycle, "state", "created") == "running" else "degraded"
        return EventBusStatusResponse(
            state=status,
            topics=len(topics),
            subscriptions=subscriptions,
            events=events,
            last_event_at=await self._last_event_at(),
            plugin_count=plugin_count,
        )

    async def _last_event_at(self) -> str | None:
        topics = await self._registry.list_topics()
        if not topics:
            return None
        latest = None
        for topic in topics:
            summary = await self._registry.topic_summary(topic)
            last_event_at = summary.get("last_event_at")
            if last_event_at and (latest is None or last_event_at > latest):
                latest = last_event_at
        return latest