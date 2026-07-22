from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel
from app.synthetic_data.models.telecom.enums import CarrierName


class Carrier(TelecomBaseModel):
    """A mobile network carrier or operator."""

    name: CarrierName = Field(description="Carrier name")
    code: str = Field(min_length=2, max_length=20, description="Carrier code")
    description: str | None = Field(default=None, max_length=500)
