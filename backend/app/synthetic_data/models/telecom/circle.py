from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel


class Circle(TelecomBaseModel):
    """A logical circle or area within a region."""

    name: str = Field(min_length=2, max_length=100, description="Circle name")
    code: str = Field(min_length=2, max_length=20, description="Circle code")
    region_id: str = Field(description="Identifier of the owning region")
    description: str | None = Field(default=None, max_length=500)
