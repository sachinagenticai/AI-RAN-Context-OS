from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel


class Site(TelecomBaseModel):
    """A physical telecom site within a cluster."""

    name: str = Field(min_length=2, max_length=120, description="Site name")
    code: str = Field(min_length=2, max_length=40, description="Site code")
    cluster_id: str = Field(description="Identifier of the owning cluster")
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    status: str = Field(default="Active", max_length=40)
