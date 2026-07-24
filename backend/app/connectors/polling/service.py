from __future__ import annotations

from typing import Any


class PollingFramework:
    def __init__(self) -> None:
        self._checkpoints: dict[str, str] = {}

    async def get_checkpoint(self, connector_id: str) -> str | None:
        return self._checkpoints.get(connector_id)

    async def update_checkpoint(self, connector_id: str, checkpoint: str) -> None:
        self._checkpoints[connector_id] = checkpoint

    async def schedule(self, connector_id: str, interval_seconds: int) -> dict[str, Any]:
        return {"connector_id": connector_id, "interval_seconds": interval_seconds, "mode": "periodic"}