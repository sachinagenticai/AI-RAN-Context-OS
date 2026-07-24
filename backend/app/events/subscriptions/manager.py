from __future__ import annotations

from app.events.registry.registry import EventRegistry, EventSubscriptionRecord


class SubscriptionManager:
    def __init__(self, registry: EventRegistry) -> None:
        self._registry = registry

    async def subscribe(self, record: EventSubscriptionRecord) -> None:
        await self._registry.register_subscription(record)

    async def unsubscribe(self, subscription_id: str) -> None:
        await self._registry.remove_subscription(subscription_id)
