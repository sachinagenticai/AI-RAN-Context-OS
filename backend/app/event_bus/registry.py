from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Any

from app.models.canonical.events.models import CanonicalEvent


@dataclass(slots=True)
class SubscriptionRecord:
    subscription_id: str
    topic: str
    subscriber_name: str
    active: bool = True
    metadata: dict[str, Any] | None = None


class EventBusRegistry:
    def __init__(self) -> None:
        self._topics: dict[str, list[CanonicalEvent]] = defaultdict(list)
        self._subscriptions: dict[str, SubscriptionRecord] = {}
        self._topic_subscriptions: dict[str, list[str]] = defaultdict(list)
        self._topic_last_event_at: dict[str, str] = {}
        self._known_topics: set[str] = set()

    async def register_topic(self, topic: str) -> None:
        self._known_topics.add(topic)
        self._topics.setdefault(topic, [])

    async def record_event(self, topic: str, event: CanonicalEvent) -> None:
        self._known_topics.add(topic)
        self._topics[topic].append(event)
        self._topic_last_event_at[topic] = event.timestamp

    async def list_events(self, topic: str) -> list[CanonicalEvent]:
        return list(self._topics.get(topic, []))

    async def list_topics(self) -> list[str]:
        return sorted(self._known_topics | set(self._topics))

    async def register_subscription(self, record: SubscriptionRecord) -> None:
        self._subscriptions[record.subscription_id] = record
        if record.subscription_id not in self._topic_subscriptions[record.topic]:
            self._topic_subscriptions[record.topic].append(record.subscription_id)

    async def remove_subscription(self, subscription_id: str) -> None:
        record = self._subscriptions.pop(subscription_id, None)
        if record is None:
            return
        self._topic_subscriptions[record.topic] = [item for item in self._topic_subscriptions[record.topic] if item != subscription_id]

    async def get_subscription(self, subscription_id: str) -> SubscriptionRecord | None:
        return self._subscriptions.get(subscription_id)

    async def list_subscriptions(self, topic: str | None = None) -> list[SubscriptionRecord]:
        if topic is None:
            return [self._subscriptions[key] for key in sorted(self._subscriptions)]
        return [self._subscriptions[key] for key in self._topic_subscriptions.get(topic, []) if key in self._subscriptions]

    async def topic_summary(self, topic: str) -> dict[str, Any]:
        return {
            "topic": topic,
            "event_count": len(self._topics.get(topic, [])),
            "subscription_count": len(self._topic_subscriptions.get(topic, [])),
            "last_event_at": self._topic_last_event_at.get(topic),
        }

    async def total_events(self) -> int:
        return sum(len(events) for events in self._topics.values())

    async def total_subscriptions(self) -> int:
        return len(self._subscriptions)
