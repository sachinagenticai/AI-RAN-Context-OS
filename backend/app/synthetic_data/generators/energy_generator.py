from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from faker import Faker

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.behavior.energy import EnergyReading


class EnergyGenerator(TelecomBaseGenerator[EnergyReading]):
    """Generate energy readings for sites and cells."""

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        super().__init__(seed=seed, faker=faker)

    async def generate_one(
        self,
        scenario: object | None = None,
        site_id: str | None = None,
        cell_id: str | None = None,
        timestamp: datetime | None = None,
    ) -> EnergyReading:
        return EnergyReading(
            site_id=site_id or "site-id",
            cell_id=cell_id or "cell-id",
            timestamp=timestamp or datetime.now(timezone.utc),
            power_kw=round(self._faker.random.uniform(1.0, 50.0), 2),
            energy_kwh=round(self._faker.random.uniform(10.0, 2000.0), 2),
            efficiency_pct=round(self._faker.random.uniform(70.0, 100.0), 2),
        )
