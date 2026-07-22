from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel
from app.synthetic_data.models.telecom.enums import BandType, Technology


class Band(TelecomBaseModel):
    """A radio band definition attached to a technology."""

    name: str = Field(min_length=2, max_length=60, description="Band name")
    frequency_mhz: int = Field(ge=1, description="Band center frequency in MHz")
    technology: Technology = Field(description="Technology associated with the band")
    band_type: BandType = Field(default=BandType.MID, description="Band category")
    carrier_id: str | None = Field(default=None, description="Optional owning carrier")
