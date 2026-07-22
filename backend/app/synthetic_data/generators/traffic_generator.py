from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from faker import Faker

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.behavior.traffic import TrafficProfile


class TrafficGenerator(TelecomBaseGenerator[TrafficProfile]):
    """Generate traffic profiles for a site/cell/sector over a horizon."""

    PROFILES: tuple[str, ...] = ("Morning Peak", "Business Hours", "Lunch", "Evening Peak", "Weekend", "Festival", "Sports Event", "Holiday", "Emergency")

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        super().__init__(seed=seed, faker=faker)

    async def generate_one(
        self,
        scenario: object | None = None,
        site_id: str | None = None,
        cell_id: str | None = None,
        sector_id: str | None = None,
        timestamp: datetime | None = None,
    ) -> TrafficProfile:
        profile = self._faker.random_element(elements=self.PROFILES)
        return TrafficProfile(
            site_id=site_id or "site-id",
            cell_id=cell_id or "cell-id",
            sector_id=sector_id or "sector-id",
            timestamp=timestamp or datetime.now(timezone.utc),
            profile=profile,
            load_percent=round(self._faker.random.uniform(10.0, 100.0), 2),
            throughput_mbps=round(self._faker.random.uniform(50.0, 1500.0), 2),
        )

    async def generate_series(
        self,
        site_id: str,
        cell_id: str,
        sector_id: str,
        horizon: str = "24h",
        points: int = 24,
    ) -> list[TrafficProfile]:
        step = self._resolve_step(horizon)
        start = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        return [
            await self.generate_one(
                site_id=site_id,
                cell_id=cell_id,
                sector_id=sector_id,
                timestamp=start + step * idx,
            )
            for idx in range(max(int(points), 1))
        ]

    def _resolve_step(self, horizon: str) -> timedelta:
        if horizon == "7d":
            return timedelta(hours=24)
        if horizon == "30d":
            return timedelta(hours=24)
        return timedelta(hours=1)
