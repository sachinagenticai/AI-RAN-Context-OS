from __future__ import annotations

from typing import Any


class CanonicalVersioningService:
    def __init__(self) -> None:
        self._latest_version = "1.0.0"

    async def get_version(self, payload: dict[str, Any] | None = None) -> str:
        if payload and isinstance(payload.get("version"), str):
            return payload["version"]
        return self._latest_version

    async def migrate(self, payload: dict[str, Any], target_version: str | None = None) -> dict[str, Any]:
        migrated = dict(payload)
        migrated["version"] = target_version or self._latest_version
        migrated.setdefault("metadata", {})
        migrated["metadata"]["migrated"] = True
        return migrated

    async def is_backward_compatible(self, version: str) -> bool:
        return version <= self._latest_version