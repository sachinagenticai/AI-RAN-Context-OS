from __future__ import annotations

from typing import Any, Protocol

from app.models.metadata.catalog import CanonicalModelCatalog
from app.models.enums.common import VendorType
from app.models.factories.canonical_factory import CanonicalModelFactory


class VendorMapper(Protocol):
    async def map_to_canonical(self, payload: dict[str, Any], *, model_type: str, vendor: str, source_system: str) -> object: ...


class MockVendorMapper:
    def __init__(self, factory: CanonicalModelFactory | None = None) -> None:
        self._factory = factory or CanonicalModelFactory()
        self._catalog = CanonicalModelCatalog()

    async def map_to_canonical(self, payload: dict[str, Any], *, model_type: str, vendor: str, source_system: str) -> object:
        normalized = self._normalize_payload(dict(payload), model_type=model_type)
        normalized.setdefault("source_system", source_system)
        normalized.setdefault("vendor", VendorType(vendor) if vendor in {item.value for item in VendorType} else VendorType.GENERIC)
        normalized.setdefault("metadata", {})
        normalized["metadata"].update({"raw_payload": dict(payload), "mapper": self.__class__.__name__})
        return self._factory.create(model_type, normalized)

    def _normalize_payload(self, payload: dict[str, Any], *, model_type: str) -> dict[str, Any]:
        model = self._catalog.get_model(model_type)
        allowed_fields = set(model.model_fields.keys())
        normalized = dict(payload)

        if "metric_name" in allowed_fields and "metric_name" not in normalized:
            normalized["metric_name"] = str(
                normalized.get("metric_name")
                or normalized.get("kpi")
                or normalized.get("name")
                or normalized.get("record_type", "generic")
            )
        if "message" in allowed_fields and "message" not in normalized and "summary" in normalized:
            normalized["message"] = str(normalized.get("summary", ""))
        if "summary" in allowed_fields and "summary" not in normalized and "message" in normalized:
            normalized["summary"] = str(normalized.get("message", ""))
        if "name" in allowed_fields and "name" not in normalized and "entity_id" in normalized:
            normalized["name"] = str(normalized.get("entity_id", ""))
        if "payload" in allowed_fields and "payload" not in normalized:
            normalized["payload"] = dict(payload)

        normalized.setdefault("metadata", {})
        normalized["metadata"] = {
            **dict(normalized.get("metadata", {})),
            "source_profile": normalized.get("source_profile"),
            "normalized_fields": dict(payload),
        }
        return {key: value for key, value in normalized.items() if key in allowed_fields or key == "metadata"}


class MapperRegistry:
    def __init__(self) -> None:
        self._mappers: dict[str, VendorMapper] = {}

    def register(self, vendor: str, mapper: VendorMapper) -> None:
        self._mappers[vendor] = mapper

    def get(self, vendor: str) -> VendorMapper:
        return self._mappers.get(vendor, self._mappers[VendorType.GENERIC.value])