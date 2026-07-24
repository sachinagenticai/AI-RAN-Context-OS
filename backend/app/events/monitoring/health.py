from __future__ import annotations


class EventHealthMonitor:
    def __init__(self, status: str = "running") -> None:
        self.status = status

    async def snapshot(self, *, topics: int, subscriptions: int, events: int, dlq_size: int) -> dict[str, object]:
        return {
            "status": self.status if dlq_size == 0 else "degraded",
            "topics": topics,
            "subscriptions": subscriptions,
            "events": events,
            "dead_letters": dlq_size,
        }
