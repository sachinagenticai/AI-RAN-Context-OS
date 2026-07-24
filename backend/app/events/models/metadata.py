from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class EventMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(min_length=1)
    correlation_id: str = Field(min_length=1)
    trace_id: str = Field(min_length=1)
    tenant_id: str = Field(min_length=1)
    source: str = Field(min_length=1)
    target: str = Field(default="")
    event_type: str = Field(min_length=1)
    timestamp: str = Field(min_length=1)
    priority: str = Field(default="P3")
    version: str = Field(default="1.0.0")
    headers: dict[str, Any] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)
    retry_count: int = Field(default=0, ge=0)

