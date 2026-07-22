from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MaintenanceEvent(BaseModel):
    """Synthetic maintenance work item for a site, cell, or sector."""

    model_config = ConfigDict(extra="forbid")

    site_id: str = Field(description="Owning site identifier")
    cell_id: str = Field(description="Owning cell identifier")
    sector_id: str = Field(description="Owning sector identifier")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    title: str = Field(description="Maintenance event title")
    description: str = Field(description="Maintenance event description")
    status: str = Field(description="Maintenance status")

    def to_dict(self) -> dict[str, Any]:
        return {
            "site_id": self.site_id,
            "cell_id": self.cell_id,
            "sector_id": self.sector_id,
            "timestamp": self.timestamp.isoformat(),
            "title": self.title,
            "description": self.description,
            "status": self.status,
        }
