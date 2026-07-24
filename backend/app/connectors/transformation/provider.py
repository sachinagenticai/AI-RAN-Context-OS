from __future__ import annotations

from typing import Any

from app.connectors.mapping.mapper import DefaultMapper
from app.models.converters.service import CanonicalConverterService
from app.models.enums.common import VendorType
from app.models.mapping.vendor_mapper import MapperRegistry, MockVendorMapper
from app.models.serializers.service import CanonicalSerializationService


class CanonicalTransformationProvider:
    def __init__(self, mapper: DefaultMapper | None = None) -> None:
        self._mapper = mapper or DefaultMapper()
        self._serialization_service = CanonicalSerializationService()
        self._mapper_registry = MapperRegistry()
        self._mapper_registry.register(VendorType.GENERIC.value, MockVendorMapper())
        self._profiles = [
            "Ericsson",
            "Nokia",
            "Huawei",
            "Samsung",
            "Cisco",
            "Juniper",
            "Mavenir",
            "Parallel Wireless",
            "ServiceNow",
            "Jira",
            "SAP",
            "Azure",
            "AWS",
            "Google Cloud",
            "Kafka",
            "OpenAI",
            "Synthetic",
        ]
        for profile in self._profiles:
            self._mapper_registry.register(profile, MockVendorMapper())
        self._converter = CanonicalConverterService(self._mapper_registry)

    async def transform(self, payload: dict[str, Any], *, profile: str) -> dict[str, Any]:
        normalized = await self._mapper.map_record(payload)
        model_type = self._resolve_model_type(normalized)
        canonical_entity = await self._converter.convert(
            payload={
                **normalized,
                "id": str(normalized.get("id", normalized.get("entity_id", "unknown"))),
                "source_profile": profile,
                "labels": {"record_type": str(normalized.get("record_type", "generic"))},
                "tags": [profile.lower().replace(" ", "_"), str(normalized.get("record_type", "generic"))],
                "metadata": {"normalized_fields": normalized, "raw_payload": payload},
            },
            model_type=model_type,
            vendor=profile,
            source_system=str(normalized.get("source", normalized.get("source_system", "connector"))),
        )
        return await self._serialization_service.export_canonical(canonical_entity)

    def _resolve_model_type(self, normalized: dict[str, Any]) -> str:
        record_type = str(normalized.get("record_type", "generic")).lower()
        if record_type in {"telemetry", "metric", "kpi", "counter", "availability"}:
            return "CanonicalTelemetry"
        if record_type in {"alarm", "alert"}:
            return "CanonicalAlarm"
        if record_type in {"inventory", "node"}:
            return "CanonicalNode"
        if record_type in {"site"}:
            return "CanonicalSite"
        if record_type in {"cell"}:
            return "CanonicalCell"
        if record_type in {"incident", "ticket", "work_order", "maintenance"}:
            return "CanonicalIncident"
        if record_type in {"event", "message", "webhook"}:
            return "CanonicalEvent"
        if record_type in {"summary", "ai", "reasoning", "decision"}:
            return "CanonicalContext"
        return "CanonicalEvent"

    async def get_profiles(self) -> list[str]:
        return list(self._profiles)