from __future__ import annotations


class EventVersionService:
    def __init__(self, current_version: str = "1.0.0") -> None:
        self._current_version = current_version

    async def current(self) -> str:
        return self._current_version

    async def compatible(self, version: str) -> bool:
        return version <= self._current_version
