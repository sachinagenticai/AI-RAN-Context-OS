from __future__ import annotations

import json
from typing import Any


class EventSerializer:
    async def to_json(self, payload: Any) -> str:
        return json.dumps(payload, sort_keys=True, default=str)

    async def to_dict(self, payload: Any) -> dict[str, Any]:
        if hasattr(payload, "model_dump"):
            return payload.model_dump(mode="json")
        return dict(payload)
