from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any


class AsyncRetryStrategy:
    def __init__(self, attempts: int = 3) -> None:
        self._attempts = attempts

    async def execute(self, operation: Callable[[], Awaitable[Any]]) -> Any:
        last_error: Exception | None = None
        for _ in range(self._attempts):
            try:
                return await operation()
            except Exception as exc:
                last_error = exc
        if last_error is not None:
            raise last_error
        raise RuntimeError("Retry strategy executed without attempts")