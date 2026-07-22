from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class KpiMetric(BaseModel):
    """A single KPI metric value for a point in time."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(description="KPI metric name")
    value: float = Field(description="Metric value")
    unit: str = Field(description="Metric unit")


class KpiSeries(BaseModel):
    """A time-series collection of KPI values for a single cell."""

    model_config = ConfigDict(extra="forbid")

    cell_id: str = Field(description="Identifier of the owning cell")
    site_id: str | None = Field(default=None, description="Identifier of the owning site")
    sector_id: str | None = Field(default=None, description="Identifier of the owning sector")
    interval: str = Field(description="Aggregation interval: hourly, daily, or weekly")
    horizon: str = Field(default="24h", description="Requested generation horizon")
    timestamps: list[datetime] = Field(description="Series timestamps in UTC")
    metrics: list[KpiMetric] = Field(description="KPI measurements for each timestamp")

    def to_dict(self) -> dict[str, Any]:
        return {
            "cell_id": self.cell_id,
            "site_id": self.site_id,
            "sector_id": self.sector_id,
            "interval": self.interval,
            "horizon": self.horizon,
            "timestamps": [stamp.isoformat() for stamp in self.timestamps],
            "metrics": [metric.model_dump(mode="json") for metric in self.metrics],
        }
