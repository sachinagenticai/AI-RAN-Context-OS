from __future__ import annotations

from collections import defaultdict
from typing import Any


class InMemoryMetricsCollector:
    def __init__(self) -> None:
        self._metrics: dict[str, dict[str, float]] = defaultdict(dict)

    async def record_metric(self, connector_id: str, metric: str, value: float) -> None:
        self._metrics.setdefault(connector_id, {})[metric] = value

    async def increment(self, connector_id: str, metric: str, value: float = 1.0) -> None:
        current = self._metrics.setdefault(connector_id, {}).get(metric, 0.0)
        self._metrics[connector_id][metric] = current + value

    async def get_metrics(self, connector_id: str | None = None) -> dict[str, Any]:
        if connector_id is not None:
            return dict(self._metrics.get(connector_id, {}))
        return {key: dict(value) for key, value in self._metrics.items()}