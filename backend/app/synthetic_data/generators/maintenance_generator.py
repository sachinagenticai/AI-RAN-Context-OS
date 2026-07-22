from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from faker import Faker

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.behavior.maintenance import MaintenanceEvent


class MaintenanceGenerator(TelecomBaseGenerator[MaintenanceEvent]):
    """Generate maintenance work events for sites, cells, and sectors."""

    TITLES: tuple[str, ...] = ("Routine Inspection", "Battery Swap", "Hardware Replacement", "Cooling Check", "Signal Calibration")
    STATUSES: tuple[str, ...] = ("Planned", "In Progress", "Completed", "Deferred")

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        super().__init__(seed=seed, faker=faker)

    async def generate_one(
        self,
        scenario: object | None = None,
        site_id: str | None = None,
        cell_id: str | None = None,
        sector_id: str | None = None,
        timestamp: datetime | None = None,
    ) -> MaintenanceEvent:
        return MaintenanceEvent(
            site_id=site_id or "site-id",
            cell_id=cell_id or "cell-id",
            sector_id=sector_id or "sector-id",
            timestamp=timestamp or datetime.now(timezone.utc),
            title=self._faker.random_element(elements=self.TITLES),
            description="Scheduled maintenance activity for the network element.",
            status=self._faker.random_element(elements=self.STATUSES),
        )
