from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from faker import Faker

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.kpi.kpi import KpiMetric, KpiSeries


class KpiGenerator(TelecomBaseGenerator[KpiSeries]):
    """Generate realistic telecom KPI time-series data for cells."""

    KPI_DEFINITIONS: tuple[tuple[str, str, float, float], ...] = (
        ("RSRP", "dBm", -120.0, -70.0),
        ("RSRQ", "dB", -20.0, -5.0),
        ("SINR", "dB", -10.0, 30.0),
        ("CQI", "index", 1.0, 15.0),
        ("DL Throughput", "Mbps", 10.0, 1000.0),
        ("UL Throughput", "Mbps", 2.0, 200.0),
        ("PRB Utilization", "%", 5.0, 95.0),
        ("Latency", "ms", 5.0, 80.0),
        ("Packet Loss", "%", 0.0, 2.5),
        ("Availability", "%", 99.0, 100.0),
    )

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        super().__init__(seed=seed, faker=faker)

    async def generate_one(self, scenario: object | None = None, cell_id: str | None = None, interval: str = "hourly", points: int = 24) -> KpiSeries:
        effective_cell_id = cell_id or "cell-id"
        base_time = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

        if interval == "daily":
            base_time = base_time.replace(hour=0)
        elif interval == "weekly":
            base_time = base_time - timedelta(days=base_time.weekday())
            base_time = base_time.replace(hour=0)

        timestamps = [base_time + timedelta(hours=i) for i in range(points)] if interval == "hourly" else [base_time + timedelta(days=i) for i in range(points)] if interval == "daily" else [base_time + timedelta(days=i * 7) for i in range(points)]

        metrics = [
            KpiMetric(
                name=name,
                value=self._round_metric_value(value),
                unit=unit,
            )
            for name, unit, low, high in self.KPI_DEFINITIONS
            for value in [self._generate_value(low, high)]
        ]

        return KpiSeries(
            cell_id=effective_cell_id,
            interval=interval,
            timestamps=timestamps,
            metrics=metrics,
        )

    async def generate_many(self, cell_id: str, interval: str = "hourly", points: int = 24, count: int = 1) -> list[KpiSeries]:
        return [await self.generate_one(cell_id=cell_id, interval=interval, points=points) for _ in range(count)]

    def _generate_value(self, low: float, high: float) -> float:
        span = high - low
        return low + (self._faker.random.random() * span)

    def _round_metric_value(self, value: float) -> float:
        return round(value, 3)
