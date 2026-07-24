from __future__ import annotations

from typing import Any

from app.models.mapping.vendor_mapper import MapperRegistry


class CanonicalConverterService:
    def __init__(self, mapper_registry: MapperRegistry) -> None:
        self._mapper_registry = mapper_registry

    async def convert(self, *, payload: dict[str, Any], model_type: str, vendor: str, source_system: str):
        mapper = self._mapper_registry.get(vendor)
        return await mapper.map_to_canonical(payload, model_type=model_type, vendor=vendor, source_system=source_system)