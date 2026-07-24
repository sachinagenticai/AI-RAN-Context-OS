from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MemoryCategory(str, Enum):
    OPERATIONAL = "Operational"
    DECISION = "Decision"
    POLICY = "Policy"
    LEARNING = "Learning"
    BUSINESS = "Business"


class MemoryEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    entity_id: str = Field(min_length=1)
    entity_type: str = Field(min_length=1)
    category: MemoryCategory
    payload: dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    incident_id: str | None = None
    policy_id: str | None = None


class MemorySummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str
    entity_type: str
    summary: str
    entry_count: int
    categories: list[str] = Field(default_factory=list)


class MemoryQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str | None = None
    entity_type: str | None = None
    incident_id: str | None = None
    policy_id: str | None = None
    start_time: str | None = None
    end_time: str | None = None
