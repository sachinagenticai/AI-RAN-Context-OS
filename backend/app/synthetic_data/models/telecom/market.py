from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel


class Market(TelecomBaseModel):
    """A market or metro area within a circle."""

    name: str = Field(min_length=2, max_length=100, description="Market name")
    code: str = Field(min_length=2, max_length=20, description="Market code")
    circle_id: str = Field(description="Identifier of the owning circle")
    description: str | None = Field(default=None, max_length=500)
