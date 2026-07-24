from __future__ import annotations

from app.models.canonical.base import CanonicalEntityModel


class CanonicalValidationService:
    async def validate(self, entity: CanonicalEntityModel) -> None:
        entity.validate_business_rules()
        if entity.confidence < 0.2 and entity.business_priority.value == "P1":
            raise ValueError("P1 canonical entities require confidence >= 0.2")