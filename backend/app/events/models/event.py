from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, model_validator


def _utc_now() -> str:
	return datetime.now(timezone.utc).isoformat()


class Event(BaseModel):
	model_config = ConfigDict(extra="forbid", populate_by_name=True)

	event_id: str = Field(default_factory=lambda: uuid4().hex, alias="event_id")
	correlation_id: str = Field(default_factory=lambda: uuid4().hex)
	trace_id: str = Field(default_factory=lambda: uuid4().hex)
	tenant_id: str = Field(default="default")
	source: str = Field(default="event_bus")
	target: str = Field(default="")
	event_type: str = Field(min_length=1)
	timestamp: str = Field(default_factory=_utc_now)
	priority: str = Field(default="P3")
	version: str = Field(default="1.0.0")
	payload: dict[str, Any] = Field(default_factory=dict)
	metadata: dict[str, Any] = Field(default_factory=dict)
	headers: dict[str, Any] = Field(default_factory=dict)
	tags: list[str] = Field(default_factory=list)
	retry_count: int = Field(default=0, ge=0)

	@model_validator(mode="after")
	def _validate_payload(self) -> "Event":
		if not self.payload:
			raise ValueError("payload is required")
		return self

	def to_dict(self) -> dict[str, Any]:
		return self.model_dump(mode="json", by_alias=True)
