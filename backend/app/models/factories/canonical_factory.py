from __future__ import annotations

from typing import Any

from app.models.enums.common import Priority, Severity, VendorType
from app.models.metadata.catalog import CanonicalModelCatalog


class CanonicalModelFactory:
    def __init__(self, catalog: CanonicalModelCatalog | None = None) -> None:
        self._catalog = catalog or CanonicalModelCatalog()

    def create(self, model_type: str, payload: dict[str, Any]):
        model = self._catalog.get_model(model_type)
        normalized = self._normalize_payload(payload)
        allowed_fields = set(model.model_fields.keys())
        filtered = {key: value for key, value in normalized.items() if key in allowed_fields}
        return model(**filtered)

    def _normalize_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = dict(payload)
        if isinstance(normalized.get("vendor"), str):
            normalized["vendor"] = VendorType(normalized["vendor"]) if normalized["vendor"] in {item.value for item in VendorType} else VendorType.GENERIC
        if isinstance(normalized.get("business_priority"), str):
            normalized["business_priority"] = Priority(normalized["business_priority"])
        if isinstance(normalized.get("severity"), str):
            normalized["severity"] = Severity(normalized["severity"])
        return normalized


class EntityFactory(CanonicalModelFactory):
    pass