import asyncio
from decimal import Decimal

from app.synthetic_data.exporters.base import BaseExporter
from app.synthetic_data.exporters.site_exporter import CsvExporter, JsonExporter
from app.synthetic_data.generators.site_generator import SiteGenerator
from app.synthetic_data.models.site import SiteGenerationScenario, SiteRecord


def test_site_generator_creates_expected_site_records() -> None:
    generator = SiteGenerator(seed=42)
    scenario = SiteGenerationScenario(name="smoke", description="smoke scenario", count=10)

    records = asyncio.run(generator.generate(scenario))

    assert len(records) == 10
    first = records[0]
    assert isinstance(first, SiteRecord)
    assert first.site_id
    assert isinstance(first.latitude, float)
    assert isinstance(first.longitude, float)
    assert first.latitude == round(first.latitude, 6)
    assert first.longitude == round(first.longitude, 6)
    assert -90 <= first.latitude <= 90
    assert -180 <= first.longitude <= 180
    assert first.vendor
    assert first.technology
    assert first.power_source
    assert first.status
    assert first.region
    assert first.market
    assert first.cluster


def test_site_generator_supports_large_batches() -> None:
    generator = SiteGenerator(seed=7)
    scenario = SiteGenerationScenario(name="bulk", description="bulk scenario", count=10_000)

    records = asyncio.run(generator.generate(scenario))

    assert len(records) == 10_000


def test_exporters_produce_json_and_csv_payloads() -> None:
    exporter_json: BaseExporter[SiteRecord] = JsonExporter()
    exporter_csv: BaseExporter[SiteRecord] = CsvExporter()
    record = SiteRecord(
        site_id="SITE-001",
        latitude=40.7128,
        longitude=-74.0060,
        vendor="Ericsson",
        technology="5G",
        power_source="Grid",
        status="Active",
        region="North America",
        market="New York",
        cluster="NYC-01",
    )

    json_payload = asyncio.run(exporter_json.export([record]))
    csv_payload = asyncio.run(exporter_csv.export([record]))

    assert '"site_id": "SITE-001"' in json_payload
    assert "site_id" in csv_payload
    assert "SITE-001" in csv_payload


def test_site_record_normalizes_decimal_coordinates_to_floats() -> None:
    record = SiteRecord(
        site_id="SITE-DEC-001",
        latitude=Decimal("40.1234567"),
        longitude=Decimal("-74.9876543"),
        vendor="Nokia",
        technology="4G",
        power_source="Grid",
        status="Active",
        region="EMEA",
        market="Berlin",
        cluster="BER-01",
    )

    assert isinstance(record.latitude, float)
    assert isinstance(record.longitude, float)
    assert record.latitude == 40.123457
    assert record.longitude == -74.987654
    assert isinstance(record.to_dict()["latitude"], float)
    assert isinstance(record.to_dict()["longitude"], float)
