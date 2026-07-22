import asyncio

from app.synthetic_data.exporters.site_exporter import CsvExporter, JsonExporter
from app.synthetic_data.generators.site_generator import SiteGenerator
from app.synthetic_data.models.site import SiteGenerationScenario
from app.synthetic_data.services.site_service import SiteGenerationService


def test_site_generation_service_exports_payloads() -> None:
    service = SiteGenerationService(
        generator=SiteGenerator(seed=123),
        exporter=JsonExporter(),
    )
    scenario = SiteGenerationScenario(name="service", description="service scenario", count=3)

    payload = asyncio.run(service.run(scenario))

    assert '"site_id"' in payload
    assert '"vendor"' in payload


def test_site_generation_service_supports_csv_export() -> None:
    service = SiteGenerationService(
        generator=SiteGenerator(seed=456),
        exporter=CsvExporter(),
    )
    scenario = SiteGenerationScenario(name="csv", description="csv scenario", count=2)

    payload = asyncio.run(service.run(scenario))

    assert "site_id" in payload
    assert "cluster" in payload
