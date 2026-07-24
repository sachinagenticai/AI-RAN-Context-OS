from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class JsonSerializer:
    async def serialize(self, payload: Any) -> str:
        return json.dumps(payload, sort_keys=True, default=str)


class JsonDeserializer:
    async def deserialize(self, payload: str) -> Any:
        return json.loads(payload)