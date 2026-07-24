from __future__ import annotations

from uuid import uuid4


class CorrelationManager:
    async def new_correlation_id(self) -> str:
        return uuid4().hex

    async def new_trace_id(self) -> str:
        return uuid4().hex
