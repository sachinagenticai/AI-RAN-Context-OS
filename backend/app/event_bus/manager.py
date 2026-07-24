from __future__ import annotations

from collections.abc import Awaitable, Callable
from time import perf_counter
from typing import Any

from app.event_bus.exceptions import EventBusNotFoundError, EventBusValidationError
from app.event_bus.health import EventBusHealthMonitor
from app.event_bus.lifecycle import EventBusLifecycle
from app.event_bus.metrics import EventBusMetricsCollector
from app.event_bus.plugins.loader import EventBusPluginLoader
from app.event_bus.registry import EventBusRegistry, SubscriptionRecord
from app.event_bus.schemas import (
    EventBusMetricsResponse,
    EventBusState,
    EventBusStatusResponse,
    EventPublishRequest,
    EventPublicationResponse,
    EventReplayRequest,
    EventReplayResponse,
    EventSubscribeRequest,
    EventSubscriptionResponse,
    EventTopicResponse,
)
from app.event_bus.validators import CanonicalEventValidator
from app.models.canonical.events.models import CanonicalEvent
from app.models.factories.canonical_factory import CanonicalModelFactory
from app.models.serializers.service import CanonicalSerializationService
from app.models.validation.service import CanonicalValidationService
from app.models.versioning.service import CanonicalVersioningService


class EventBusManager:
    def __init__(
        self,
        *,
        registry: EventBusRegistry,
        metrics: EventBusMetricsCollector,
        lifecycle: EventBusLifecycle,
        health_monitor: EventBusHealthMonitor,
        plugin_loader: EventBusPluginLoader,
        canonical_factory: CanonicalModelFactory,
        canonical_validator: CanonicalValidationService,
        canonical_serializer: CanonicalSerializationService,
        canonical_versioning: CanonicalVersioningService,
        event_validator: CanonicalEventValidator,
        plugin_paths: list[str] | None = None,
    ) -> None:
        self._registry = registry
        self._metrics = metrics
        self._lifecycle = lifecycle
        self._health_monitor = health_monitor
        self._plugin_loader = plugin_loader
        self._canonical_factory = canonical_factory
        self._canonical_validator = canonical_validator
        self._canonical_serializer = canonical_serializer
        self._canonical_versioning = canonical_versioning
        self._event_validator = event_validator
        self._plugin_paths = plugin_paths or []
        self._subscriptions: dict[str, Any] = {}

    async def initialize(self) -> None:
        await self._lifecycle.initialize()
        if self._plugin_paths:
            await self._plugin_loader.load(self, self._plugin_paths)

    async def start(self) -> None:
        await self._lifecycle.start()

    async def stop(self) -> None:
        await self._lifecycle.stop()

    async def restart(self) -> None:
        await self._lifecycle.restart()

    async def register_topic(self, topic: str) -> None:
        await self._registry.register_topic(topic)

    async def publish(self, topic: str, event_payload: dict[str, Any]) -> EventPublicationResponse:
        event = self._canonical_factory.create("CanonicalEvent", event_payload)
        await self._event_validator.validate(event)
        await self._canonical_validator.validate(event)
        await self._registry.record_event(topic, event)
        await self._metrics.record_publish(topic)
        started = perf_counter()
        delivered_to: list[str] = []
        for subscription in await self._registry.list_subscriptions(topic):
            subscriber = self._subscriptions.get(subscription.subscription_id)
            if subscriber is None or not subscription.active:
                continue
            try:
                await subscriber.on_event(event)
                delivered_to.append(subscription.subscription_id)
                await self._metrics.record_delivery((perf_counter() - started) * 1000)
            except Exception:
                await self._metrics.record_failure()
        return EventPublicationResponse(accepted=True, topic=topic, event_id=event.id, delivered_to=delivered_to)

    async def publish_request(self, request: EventPublishRequest) -> EventPublicationResponse:
        return await self.publish(request.topic, request.event)

    async def subscribe(self, record: SubscriptionRecord, subscriber: Any) -> EventSubscriptionResponse:
        await self._registry.register_subscription(record)
        self._subscriptions[record.subscription_id] = subscriber
        return EventSubscriptionResponse(subscription_id=record.subscription_id, topic=record.topic, subscriber_name=record.subscriber_name, active=record.active)

    async def subscribe_request(self, request: EventSubscribeRequest) -> EventSubscriptionResponse:
        subscriber = _RecordingSubscriber(request.subscriber_name)
        record = SubscriptionRecord(
            subscription_id=f"sub-{len(self._subscriptions) + 1}",
            topic=request.topic,
            subscriber_name=request.subscriber_name,
            metadata=request.metadata,
        )
        return await self.subscribe(record, subscriber)

    async def unsubscribe(self, subscription_id: str) -> None:
        self._subscriptions.pop(subscription_id, None)
        await self._registry.remove_subscription(subscription_id)

    async def list_topics(self) -> list[str]:
        return await self._registry.list_topics()

    async def topic_summary(self, topic: str) -> EventTopicResponse:
        summary = await self._registry.topic_summary(topic)
        return EventTopicResponse(**summary)

    async def metrics(self) -> EventBusMetricsResponse:
        snapshot = await self._metrics.snapshot(await self._registry.total_subscriptions())
        return EventBusMetricsResponse(**snapshot)

    async def status(self) -> EventBusStatusResponse:
        snapshot = await self._health_monitor.health(plugin_count=len(self._plugin_paths))
        return snapshot

    async def health(self) -> EventBusStatusResponse:
        return await self._health_monitor.health(plugin_count=len(self._plugin_paths))

    async def replay(self, request: EventReplayRequest) -> EventReplayResponse:
        events = await self._registry.list_events(request.topic)
        replayed = events[: request.limit]
        return EventReplayResponse(topic=request.topic, replayed=len(replayed), events=[event.to_dict() for event in replayed])

    async def load_plugin(self, plugin_path: str) -> list[str]:
        return await self._plugin_loader.load(self, [plugin_path])


class _RecordingSubscriber:
    def __init__(self, name: str) -> None:
        self.name = name
        self.events: list[CanonicalEvent] = []

    async def on_event(self, event: CanonicalEvent) -> None:
        self.events.append(event)