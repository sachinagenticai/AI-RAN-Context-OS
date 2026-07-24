from __future__ import annotations

from datetime import datetime, timezone


class EventBusLifecycle:
    def __init__(self) -> None:
        self.state = "created"
        self.started_at: str | None = None
        self.stopped_at: str | None = None

    async def initialize(self) -> None:
        self.state = "initialized"

    async def start(self) -> None:
        self.state = "running"
        self.started_at = datetime.now(timezone.utc).isoformat()

    async def stop(self) -> None:
        self.state = "stopped"
        self.stopped_at = datetime.now(timezone.utc).isoformat()

    async def restart(self) -> None:
        await self.stop()
        await self.start()