from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class TrafficProfile(BaseModel):
    """Synthetic traffic profile for a site, cell, or sector."""

    model_config = ConfigDict(extra="forbid")

    site_id: str = Field(description="Owning site identifier")
    cell_id: str = Field(description="Owning cell identifier")
    sector_id: str = Field(description="Owning sector identifier")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    profile: str = Field(description="Traffic profile label")
    load_percent: float = Field(description="Load percentage")
    throughput_mbps: float = Field(description="Throughput in Mbps")

    def to_dict(self) -> dict[str, Any]:
        return {
            "site_id": self.site_id,
            "cell_id": self.cell_id,
            "sector_id": self.sector_id,
            "timestamp": self.timestamp.isoformat(),
            "profile": self.profile,
            "load_percent": self.load_percent,
            "throughput_mbps": self.throughput_mbps,
        }
