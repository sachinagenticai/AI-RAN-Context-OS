from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class EnergyReading(BaseModel):
    """Synthetic energy consumption reading for a site or cell."""

    model_config = ConfigDict(extra="forbid")

    site_id: str = Field(description="Owning site identifier")
    cell_id: str = Field(description="Owning cell identifier")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    power_kw: float = Field(description="Power draw in kilowatts")
    energy_kwh: float = Field(description="Energy used in kilowatt-hours")
    efficiency_pct: float = Field(description="Energy efficiency percentage")

    def to_dict(self) -> dict[str, Any]:
        return {
            "site_id": self.site_id,
            "cell_id": self.cell_id,
            "timestamp": self.timestamp.isoformat(),
            "power_kw": self.power_kw,
            "energy_kwh": self.energy_kwh,
            "efficiency_pct": self.efficiency_pct,
        }
