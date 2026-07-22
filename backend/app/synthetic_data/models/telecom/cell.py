from __future__ import annotations

from typing import Annotated

from pydantic import Field, field_validator

from app.synthetic_data.models.telecom.base import TelecomBaseModel
from app.synthetic_data.models.telecom.enums import Technology
from app.synthetic_data.models.telecom.sector import Sector


class Cell(TelecomBaseModel):
    """A radio cell attached to a site and containing exactly three sectors."""

    site_id: str = Field(description="Identifier of the owning site")
    name: str = Field(min_length=2, max_length=80, description="Cell name")
    technology: Technology = Field(default=Technology.LTE, description="Radio access technology")
    sectors: Annotated[list[Sector], Field(min_length=3, max_length=3)]

    @field_validator("sectors")
    @classmethod
    def validate_sector_count(cls, value: list[Sector]) -> list[Sector]:
        if len(value) != 3:
            raise ValueError("A cell must contain exactly 3 sectors")
        return value
