from __future__ import annotations

import json
from typing import Any

from app.models.canonical.base import CanonicalEntityModel


class CanonicalSerializationService:
    async def to_json(self, entity: CanonicalEntityModel) -> str:
        return entity.to_json()

    async def to_yaml(self, entity: CanonicalEntityModel) -> str:
        return entity.to_yaml()

    async def to_dict(self, entity: CanonicalEntityModel) -> dict[str, Any]:
        return entity.to_dict()

    async def from_json(self, payload: str) -> dict[str, Any]:
        return json.loads(payload)

    async def from_yaml(self, payload: str) -> dict[str, Any]:
        try:
            import yaml  # type: ignore

            return yaml.safe_load(payload)
        except Exception:
            return json.loads(payload)

    async def export_canonical(self, entity: CanonicalEntityModel) -> dict[str, Any]:
        return entity.to_dict()

    async def import_canonical(self, payload: dict[str, Any]) -> dict[str, Any]:
        return dict(payload)