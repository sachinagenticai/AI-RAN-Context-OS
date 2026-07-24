from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from app.events.audit.audit import AuditEntry, EventAuditLog
from app.events.configuration.config import EventBusConfig
from app.events.dead_letter.dlq import DeadLetterQueue
from app.events.exceptions.exceptions import EventValidationError
from app.events.handlers.base_handler import BaseEventHandler
from app.events.interfaces.dispatcher import EventDispatcher
from app.events.interfaces.publisher import EventPublisher
from app.events.interfaces.subscriber import EventSubscriber
from app.events.models.event import Event
from app.events.monitoring.health import EventHealthMonitor
from app.events.monitoring.metrics import EventMetricsCollector
from app.events.persistence.event_store import EventStore
from app.events.registry.registry import EventRegistry, EventSubscriptionRecord
from app.events.replay.replay_service import EventReplayService
from app.events.retry.retry_policy import RetryPolicy
from app.events.routing.router import EventRouter
from app.events.serialization.serializer import EventSerializer
from app.events.tracing.correlation import CorrelationManager
from app.events.versioning.version import EventVersionService
from app.models.factories.canonical_factory import CanonicalModelFactory


class _CallableEventHandler(BaseEventHandler):
    def __init__(self, name: str, handler: Callable[[Event], Awaitable[None]]) -> None:
        self.name = name
        self._handler = handler

    async def handle(self, event: Event) -> None:
        await self._handler(event)


class EnterpriseEventBus(EventPublisher, EventDispatcher):
    def __init__(self, config: EventBusConfig | None = None) -> None:
        self._config = config or EventBusConfig()
        self._registry = EventRegistry()
        self._store = EventStore()
        self._router = EventRouter()
        self._metrics = EventMetricsCollector()
        self._dlq = DeadLetterQueue()
        self._retry = RetryPolicy()
        self._health = EventHealthMonitor()
        self._audit = EventAuditLog()
        self._serializer = EventSerializer()
        self._correlation = CorrelationManager()
        self._versioning = EventVersionService(self._config.version)
        self._factory = CanonicalModelFactory()
        self._replay = EventReplayService(self._store)
        self._dispatcher = None
        self._state = "created"

    async def initialize(self) -> None:
        self._state = "initialized"

    async def start(self) -> None:
        self._state = "running"

    async def stop(self) -> None:
        self._state = "stopped"

    async def restart(self) -> None:
        await self.stop()
        await self.start()

    async def register_topic(self, topic: str) -> None:
        await self._registry.register_topic(topic)

    async def list_topics(self) -> list[str]:
        topics = set(await self._registry.topics())
        topics.update(await self._store.topics())
        return sorted(topics)

    async def subscribe(self, topic: str, subscriber: EventSubscriber, subscriber_name: str | None = None, metadata: dict[str, Any] | None = None) -> str:
        subscription_id = f"sub-{len(await self._registry.list_subscriptions()) + 1}"
        record = EventSubscriptionRecord(
            subscription_id=subscription_id,
            topic=topic,
            subscriber_name=subscriber_name or getattr(subscriber, "name", subscription_id),
            handler=subscriber,
            metadata=metadata or {},
        )
        await self._registry.register_subscription(record)
        await self._router.register(topic, _CallableEventHandler(record.subscriber_name, subscriber.handle if hasattr(subscriber, "handle") else subscriber.on_event))
        return subscription_id

    async def unsubscribe(self, subscription_id: str) -> None:
        record = await self._registry.get(subscription_id)
        if record is None:
            return
        await self._registry.remove_subscription(subscription_id)

    async def topic_summary(self, topic: str) -> dict[str, Any]:
        events = await self._store.list_topic(topic)
        subscriptions = await self._registry.list_subscriptions(topic)
        last_event_at = events[-1].timestamp if events else None
        return {
            "topic": topic,
            "event_count": len(events),
            "subscription_count": len(subscriptions),
            "last_event_at": last_event_at,
        }

    async def publish(self, event: Event) -> Event:
        if not event.event_type:
            raise EventValidationError("event_type is required")
        if not event.correlation_id:
            event.correlation_id = await self._correlation.new_correlation_id()
        if not event.trace_id:
            event.trace_id = await self._correlation.new_trace_id()
        if not event.version:
            event.version = await self._versioning.current()
        topic = getattr(event.event_type, "value", str(event.event_type))
        await self._store.append(topic, event)
        await self._metrics.record_publish(topic)
        await self._audit.record(AuditEntry(event_id=event.event_id, event_type=topic, topic=topic, status="published", timestamp=event.timestamp))
        await self.dispatch(topic, event)
        return event

    async def publish_payload(self, payload: dict[str, Any]) -> Event:
        event = self._build_event(payload)
        return await self.publish(event)

    def _build_event(self, payload: dict[str, Any]) -> Event:
        payload_copy = dict(payload)
        payload_body = payload_copy.pop("payload", {})
        if isinstance(payload_body, dict) and "payload" in payload_body and len(payload_body) == 1:
            payload_body = payload_body["payload"]
        event_type = str(payload_copy.pop("event_type", payload_copy.pop("type", "")))
        if not event_type:
            raise EventValidationError("event_type is required")
        event_payload: dict[str, Any] = {
            "event_type": event_type,
            "payload": payload_body if isinstance(payload_body, dict) else {"value": payload_body},
            "metadata": dict(payload_copy.pop("metadata", {})),
            "headers": dict(payload_copy.pop("headers", {})),
            "tags": list(payload_copy.pop("tags", [])),
            "retry_count": int(payload_copy.pop("retry_count", 0)),
            "tenant_id": str(payload_copy.pop("tenant_id", "default")),
            "source": str(payload_copy.pop("source", payload_copy.pop("source_system", "event_bus"))),
            "target": str(payload_copy.pop("target", "")),
            "priority": str(payload_copy.pop("priority", "P3")),
            "version": str(payload_copy.pop("version", self._config.version)),
        }
        optional_keys = ("event_id", "id", "correlation_id", "trace_id", "timestamp")
        for key in optional_keys:
            value = payload_copy.pop(key, "")
            if value:
                event_payload["event_id" if key in {"event_id", "id"} else key] = str(value)
        return Event(**event_payload)

    async def dispatch(self, topic: str, event: Event) -> None:
        handlers = await self._router.resolve(event)
        for handler in handlers:
            try:
                await self._retry.execute(lambda: handler.handle(event))
                await self._metrics.record_delivery()
            except Exception as exc:
                await self._metrics.record_failure()
                await self._dlq.push({"event_id": event.event_id, "event_type": event.event_type, "topic": topic, "reason": str(exc), "payload": event.model_dump(mode="json")})

    async def history(self, topic: str | None = None) -> list[dict[str, Any]]:
        events = await (self._store.list_topic(topic) if topic else self._store.list_all())
        return [event.model_dump(mode="json") for event in events]

    async def replay(self, topic: str, limit: int) -> list[dict[str, Any]]:
        return await self._replay.replay(topic, limit)

    async def dead_letters(self) -> list[dict[str, Any]]:
        entries = await self._dlq.list()
        return [entry.__dict__ if hasattr(entry, "__dict__") else dict(entry) for entry in entries]

    async def metrics(self) -> dict[str, Any]:
        return await self._metrics.snapshot()

    async def health(self) -> dict[str, Any]:
        return await self._health.snapshot(
            topics=len(await self._registry.topics()),
            subscriptions=len(await self._registry.list_subscriptions()),
            events=len(await self._store.list_all()),
            dlq_size=len(await self._dlq.list()),
        )

    async def status(self) -> dict[str, Any]:
        return {
            "state": self._state,
            "topics": len(await self._registry.topics()),
            "subscriptions": len(await self._registry.list_subscriptions()),
            "events": len(await self._store.list_all()),
            "dead_letters": len(await self._dlq.list()),
        }


event_bus = EnterpriseEventBus()
