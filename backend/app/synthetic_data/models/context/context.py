from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ContextObject(BaseModel):
    """A merged telecom context payload for downstream AI and operational use."""

    model_config = ConfigDict(extra="forbid")

    entity_id: str = Field(description="Identifier of the primary entity being contextualized")
    entity_type: str = Field(description="Type of the primary entity, such as site, cell, or sector")
    inventory_summary: dict[str, Any] = Field(default_factory=dict, description="Summary of inventory details")
    kpi_summary: dict[str, Any] = Field(default_factory=dict, description="Summary of KPI metrics")
    alarm_summary: dict[str, Any] = Field(default_factory=dict, description="Summary of alarms")
    weather_summary: dict[str, Any] = Field(default_factory=dict, description="Summary of weather observations")
    insights: list[str] = Field(default_factory=list, description="Derived operational insights")

    def to_dict(self) -> dict[str, Any]:
        return self.model_dump(mode="json")
