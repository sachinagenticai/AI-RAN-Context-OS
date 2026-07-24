import asyncio

from app.models.converters.service import CanonicalConverterService
from app.models.mapping.vendor_mapper import MapperRegistry, MockVendorMapper
from app.models.enums.common import VendorType


def test_mock_vendor_mapper_converts_payload_to_canonical_entity() -> None:
    registry = MapperRegistry()
    registry.register(VendorType.GENERIC.value, MockVendorMapper())
    registry.register(VendorType.SYNTHETIC.value, MockVendorMapper())
    converter = CanonicalConverterService(registry)

    entity = asyncio.run(
        converter.convert(
            payload={"metric_name": "availability", "value": 99.95},
            model_type="CanonicalTelemetry",
            vendor="Synthetic",
            source_system="synthetic-connector",
        )
    )

    assert entity.entity_type == "canonical_telemetry"
    assert entity.metadata["raw_payload"]["value"] == 99.95