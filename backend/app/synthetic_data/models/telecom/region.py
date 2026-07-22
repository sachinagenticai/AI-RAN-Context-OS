from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel


class Region(TelecomBaseModel):
    """Top-level geographic region for inventory grouping."""

    name: str = Field(min_length=2, max_length=100, description="Region name")
    code: str = Field(min_length=2, max_length=20, description="Region code")
    description: str | None = Field(default=None, max_length=500)
