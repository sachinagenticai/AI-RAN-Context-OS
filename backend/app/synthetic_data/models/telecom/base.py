from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class TelecomBaseModel(BaseModel):
    """Base model for telecom inventory entities with enterprise defaults."""

    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    id: UUID = Field(default_factory=uuid4, description="Unique identifier")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp in UTC",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp in UTC",
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize the model into a dictionary for exporters and tests."""
        return self.model_dump(mode="json")
