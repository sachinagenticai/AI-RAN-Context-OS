from __future__ import annotations

import json
from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums.common import Priority, Severity, VendorType


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class CanonicalEntityModel(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True, strict=True)

    id: str = Field(default_factory=lambda: uuid4().hex, min_length=1)
    source_system: str = Field(default="connector", min_length=1)
    vendor: VendorType = VendorType.GENERIC
    timestamp: str = Field(default_factory=_now)
    version: str = Field(default="1.0.0", min_length=1)
    correlation_id: str = Field(default_factory=lambda: f"corr-{uuid4().hex}", min_length=1)
    tenant_id: str = Field(default="default", min_length=1)
    labels: dict[str, str] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, object] = Field(default_factory=dict)
    status: str = Field(default="active", min_length=1)
    created_time: str = Field(default_factory=_now)
    updated_time: str = Field(default_factory=_now)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    severity: Severity | None = None
    business_priority: Priority = Priority.P3
    entity_type: str = Field(default="canonical_entity", min_length=1)

    @model_validator(mode="after")
    def _validate_times(self) -> "CanonicalEntityModel":
        if self.updated_time < self.created_time:
            raise ValueError("updated_time must be greater than or equal to created_time")
        return self

    def to_dict(self) -> dict[str, object]:
        return self.model_dump(mode="json")

    def to_json(self) -> str:
        return self.model_dump_json(indent=2)

    def to_yaml(self) -> str:
        return json.dumps(self.to_dict(), indent=2, sort_keys=True)

    def model_version(self) -> str:
        return self.version

    def validate_business_rules(self) -> None:
        if not self.source_system:
            raise ValueError("source_system is required")