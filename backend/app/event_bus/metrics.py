from __future__ import annotations

from collections import defaultdict


class EventBusMetricsCollector:
    def __init__(self) -> None:
        self._published = 0
        self._delivered = 0
        self._failed = 0
        self._delivery_latency_samples: list[float] = []
        self._topic_events: dict[str, int] = defaultdict(int)

    async def record_publish(self, topic: str) -> None:
        self._published += 1
        self._topic_events[topic] += 1

    async def record_delivery(self, latency_ms: float) -> None:
        self._delivered += 1
        self._delivery_latency_samples.append(round(latency_ms, 3))

    async def record_failure(self) -> None:
        self._failed += 1

    async def snapshot(self, subscriptions: int) -> dict[str, object]:
        average_latency = round(sum(self._delivery_latency_samples) / len(self._delivery_latency_samples), 3) if self._delivery_latency_samples else 0.0
        return {
            "published": self._published,
            "delivered": self._delivered,
            "failed": self._failed,
            "subscriptions": subscriptions,
            "topic_events": dict(sorted(self._topic_events.items())),
            "delivery_latency_ms": average_latency,
        }