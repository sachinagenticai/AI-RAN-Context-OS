from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AlarmSeverity(str, Enum):
    """Supported alarm severity levels."""

    CRITICAL = "Critical"
    MAJOR = "Major"
    MINOR = "Minor"
    WARNING = "Warning"
    CLEAR = "Clear"


class Alarm(BaseModel):
    """A telecom alarm associated with a site, cell, or sector."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(description="Unique alarm identifier")
    title: str = Field(description="Alarm title")
    description: str = Field(description="Alarm description")
    severity: AlarmSeverity = Field(description="Alarm severity")
    affected_entity_type: str = Field(description="One of site, cell, or sector")
    affected_entity_id: str = Field(description="Identifier of the affected site, cell, or sector")
    site_id: str | None = Field(default=None, description="Identifier of the owning site")
    cell_id: str | None = Field(default=None, description="Identifier of the owning cell")
    sector_id: str | None = Field(default=None, description="Identifier of the owning sector")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "severity": self.severity.value,
            "affected_entity_type": self.affected_entity_type,
            "affected_entity_id": self.affected_entity_id,
            "site_id": self.site_id,
            "cell_id": self.cell_id,
            "sector_id": self.sector_id,
            "created_at": self.created_at.isoformat(),
        }
