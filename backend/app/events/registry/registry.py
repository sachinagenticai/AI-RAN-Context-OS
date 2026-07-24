from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class EventSubscriptionRecord:
    subscription_id: str
    topic: str
    subscriber_name: str
    handler: Any
    active: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)


class EventRegistry:
    def __init__(self) -> None:
        self._subscriptions: dict[str, EventSubscriptionRecord] = {}
        self._topics: set[str] = set()

    async def register_topic(self, topic: str) -> None:
        self._topics.add(topic)

    async def register_subscription(self, record: EventSubscriptionRecord) -> None:
        self._subscriptions[record.subscription_id] = record
        self._topics.add(record.topic)

    async def remove_subscription(self, subscription_id: str) -> None:
        self._subscriptions.pop(subscription_id, None)

    async def list_subscriptions(self, topic: str | None = None) -> list[EventSubscriptionRecord]:
        values = list(self._subscriptions.values())
        if topic is None:
            return sorted(values, key=lambda item: item.subscription_id)
        return [record for record in values if record.topic == topic]

    async def topics(self) -> list[str]:
        return sorted(self._topics)

    async def get(self, subscription_id: str) -> EventSubscriptionRecord | None:
        return self._subscriptions.get(subscription_id)
