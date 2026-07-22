from __future__ import annotations

from typing import Any

from faker import Faker

from app.synthetic_data.generators.base import BaseGenerator
from app.synthetic_data.models.site import SiteGenerationScenario, SiteRecord


class SiteGenerator(BaseGenerator[SiteRecord]):
    """Generate realistic synthetic telecom site records.

    This implementation intentionally stays framework-oriented and does not
    introduce any business rules beyond a deterministic, test-friendly shape.
    """

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        self._faker = faker or Faker()
        if seed is not None:
            self._faker.seed_instance(seed)

    async def generate(self, scenario: SiteGenerationScenario) -> list[SiteRecord]:
        count = max(int(scenario.count), 1)
        return [await self.generate_one(scenario) for _ in range(count)]

    async def generate_one(
        self,
        scenario: SiteGenerationScenario | None = None,
        region: str | None = None,
        market: str | None = None,
        cluster: str | None = None,
    ) -> SiteRecord:
        return SiteRecord(
            site_id=self._build_site_id(),
            latitude=self._faker.latitude(),
            longitude=self._faker.longitude(),
            vendor=self._faker.random_element(elements=["Nokia", "Ericsson", "Huawei", "Samsung"]),
            technology=self._faker.random_element(elements=["2G", "3G", "4G", "5G", "6G"]),
            power_source=self._faker.random_element(elements=["Grid", "Solar", "Generator", "Battery"]),
            status=self._faker.random_element(elements=["Active", "Standby", "Maintenance", "Planning"]),
            region=region or self._faker.random_element(elements=["North America", "EMEA", "APAC", "LATAM"]),
            market=market or self._faker.city(),
            cluster=cluster or self._faker.random_element(elements=["Cluster-A", "Cluster-B", "Cluster-C", "Cluster-D"]),
        )

    def _build_site_id(self) -> str:
        return f"SITE-{self._faker.unique.random_int(min=1000, max=999999)}"
