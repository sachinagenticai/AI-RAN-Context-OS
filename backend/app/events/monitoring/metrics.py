from __future__ import annotations

from collections import defaultdict


class EventMetricsCollector:
    def __init__(self) -> None:
        self.published = 0
        self.delivered = 0
        self.failed = 0
        self.replayed = 0
        self.topic_counts: dict[str, int] = defaultdict(int)

    async def record_publish(self, topic: str) -> None:
        self.published += 1
        self.topic_counts[topic] += 1

    async def record_delivery(self) -> None:
        self.delivered += 1

    async def record_failure(self) -> None:
        self.failed += 1

    async def record_replay(self, count: int) -> None:
        self.replayed += count

    async def snapshot(self) -> dict[str, object]:
        return {
            "published": self.published,
            "delivered": self.delivered,
            "failed": self.failed,
            "replayed": self.replayed,
            "topic_counts": dict(sorted(self.topic_counts.items())),
        }
