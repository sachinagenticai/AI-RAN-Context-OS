from __future__ import annotations

from typing import Any


class DefaultMapper:
    async def map_record(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {str(key).strip().lower().replace(" ", "_"): value for key, value in payload.items()}