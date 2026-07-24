from __future__ import annotations

from time import perf_counter

from app.events.dead_letter.dlq import DeadLetterEntry, DeadLetterQueue
from app.events.models.event import Event
from app.events.monitoring.metrics import EventMetricsCollector
from app.events.registry.registry import EventRegistry
from app.events.retry.retry_policy import RetryPolicy
from app.events.routing.router import EventRouter


class EventDispatcherImpl:
    def __init__(self, *, registry: EventRegistry, router: EventRouter, metrics: EventMetricsCollector, dlq: DeadLetterQueue, retry_policy: RetryPolicy) -> None:
        self._registry = registry
        self._router = router
        self._metrics = metrics
        self._dlq = dlq
        self._retry_policy = retry_policy

    async def dispatch(self, topic: str, event: Event) -> None:
        handlers = await self._router.resolve(event)
        for handler in handlers:
            started = perf_counter()
            try:
                await self._retry_policy.execute(lambda: handler.handle(event))
                await self._metrics.record_delivery()
            except Exception as exc:
                await self._metrics.record_failure()
                await self._dlq.push(
                    DeadLetterEntry(
                        event_id=event.event_id,
                        event_type=event.event_type,
                        topic=topic,
                        reason=str(exc),
                        payload=event.model_dump(mode="json"),
                    )
                )
