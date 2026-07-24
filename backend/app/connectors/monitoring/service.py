from __future__ import annotations

from collections import Counter

from app.connectors.schemas.connector_schemas import ConnectorRuntimeStatus


class ConnectorMonitoringService:
    async def summarize(self, statuses: list[ConnectorRuntimeStatus]) -> dict[str, int]:
        counts = Counter(status.state.value for status in statuses)
        return dict(counts)