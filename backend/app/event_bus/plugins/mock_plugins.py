from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.event_bus.registry import SubscriptionRecord
from app.event_bus.schemas import EventPublishRequest
from app.models.canonical.events.models import CanonicalEvent


@dataclass(slots=True)
class AuditSubscriber:
    name: str
    events: list[CanonicalEvent]

    async def on_event(self, event: CanonicalEvent) -> None:
        self.events.append(event)


async def register_plugins(bus: Any) -> list[str]:
    subscriber = AuditSubscriber(name="audit_subscriber", events=[])
    await bus.register_topic("platform.events")
    await bus.subscribe(
        SubscriptionRecord(
            subscription_id="audit_subscriber",
            topic="platform.events",
            subscriber_name=subscriber.name,
            metadata={"kind": "audit"},
        ),
        subscriber,
    )
    return [subscriber.name]