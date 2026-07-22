from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class WeatherEvent(BaseModel):
    """Synthetic weather conditions for a network region/market/cluster."""

    model_config = ConfigDict(extra="forbid")

    region_id: str = Field(description="Owning region identifier")
    market_id: str = Field(description="Owning market identifier")
    cluster_id: str = Field(description="Owning cluster identifier")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    condition: str = Field(description="Weather condition")
    temperature_c: float = Field(description="Temperature in Celsius")
    humidity_pct: float = Field(description="Relative humidity percentage")
    wind_speed_kph: float = Field(description="Wind speed in kilometers per hour")

    def to_dict(self) -> dict[str, Any]:
        return {
            "region_id": self.region_id,
            "market_id": self.market_id,
            "cluster_id": self.cluster_id,
            "timestamp": self.timestamp.isoformat(),
            "condition": self.condition,
            "temperature_c": self.temperature_c,
            "humidity_pct": self.humidity_pct,
            "wind_speed_kph": self.wind_speed_kph,
        }
