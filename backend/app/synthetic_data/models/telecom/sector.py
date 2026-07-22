from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel
from app.synthetic_data.models.telecom.enums import SectorId


class Sector(TelecomBaseModel):
    """A single sector of a cell."""

    cell_id: str = Field(description="Identifier of the owning cell")
    sector_id: SectorId = Field(description="Logical sector identifier")
    azimuth: int = Field(ge=0, le=360, description="Sector azimuth in degrees")
    power_dbm: float = Field(ge=0, description="Sector transmit power in dBm")
