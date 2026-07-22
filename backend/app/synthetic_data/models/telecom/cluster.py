from __future__ import annotations

from pydantic import Field

from app.synthetic_data.models.telecom.base import TelecomBaseModel


class Cluster(TelecomBaseModel):
    """A cluster grouping within a market."""

    name: str = Field(min_length=2, max_length=100, description="Cluster name")
    code: str = Field(min_length=2, max_length=20, description="Cluster code")
    market_id: str = Field(description="Identifier of the owning market")
    description: str | None = Field(default=None, max_length=500)
