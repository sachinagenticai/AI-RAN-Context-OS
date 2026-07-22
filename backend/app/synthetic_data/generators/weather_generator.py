from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from faker import Faker

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.behavior.weather import WeatherEvent


class WeatherGenerator(TelecomBaseGenerator[WeatherEvent]):
    """Generate synthetic weather events for a region/market/cluster hierarchy."""

    CONDITIONS: tuple[str, ...] = ("Sunny", "Rain", "Heavy Rain", "Storm", "Cyclone", "Fog")

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        super().__init__(seed=seed, faker=faker)

    async def generate_one(
        self,
        scenario: object | None = None,
        region_id: str | None = None,
        market_id: str | None = None,
        cluster_id: str | None = None,
        timestamp: datetime | None = None,
    ) -> WeatherEvent:
        condition = self._faker.random_element(elements=self.CONDITIONS)
        return WeatherEvent(
            region_id=region_id or "region-id",
            market_id=market_id or "market-id",
            cluster_id=cluster_id or "cluster-id",
            timestamp=timestamp or datetime.now(timezone.utc),
            condition=condition,
            temperature_c=round(self._faker.random.uniform(-10.0, 45.0), 2),
            humidity_pct=round(self._faker.random.uniform(20.0, 100.0), 2),
            wind_speed_kph=round(self._faker.random.uniform(0.0, 120.0), 2),
        )

    async def generate_series(
        self,
        region_id: str,
        market_id: str,
        cluster_id: str,
        horizon: str = "24h",
        points: int = 24,
    ) -> list[WeatherEvent]:
        step = self._resolve_step(horizon)
        start = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        return [
            await self.generate_one(
                region_id=region_id,
                market_id=market_id,
                cluster_id=cluster_id,
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
