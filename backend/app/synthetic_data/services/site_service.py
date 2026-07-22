from __future__ import annotations

from typing import Any

from app.synthetic_data.exporters.base import BaseExporter
from app.synthetic_data.generators.site_generator import SiteGenerator
from app.synthetic_data.models.site import SiteGenerationScenario, SiteRecord
from app.synthetic_data.services.base import BaseWorkflowService


class SiteGenerationService(BaseWorkflowService):
    """Orchestrate site generation with dependency injection support."""

    def __init__(self, generator: SiteGenerator, exporter: BaseExporter[SiteRecord]) -> None:
        self._generator = generator
        self._exporter = exporter

    async def run(self, scenario: SiteGenerationScenario) -> Any:
        records = await self._generator.generate(scenario)
        return await self._exporter.export(records)
