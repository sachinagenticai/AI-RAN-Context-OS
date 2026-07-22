from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from pydantic import BaseModel as PydanticBaseModel, ConfigDict, Field, field_validator

from app.synthetic_data.models.base import BaseModel as AbstractModel
from app.synthetic_data.models.base import BaseScenario


class SiteRecord(PydanticBaseModel, AbstractModel["SiteRecord"]):
    """A synthetic telecom site record.

    Coordinates are normalized to plain floats with six decimal places at the
    domain-model boundary so exporters remain generic and future formats inherit
    the same serialization contract.
    """

    model_config = ConfigDict(extra="forbid")

    site_id: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    vendor: str
    technology: str
    power_source: str
    status: str
    region: str
    market: str
    cluster: str

    @field_validator("latitude", "longitude", mode="before")
    @classmethod
    def normalize_coordinates(cls, value: Any) -> float:
        if isinstance(value, Decimal):
            normalized = value.quantize(Decimal("0.000001"))
            return float(normalized)
        if isinstance(value, (int, float)):
            normalized = Decimal(str(value)).quantize(Decimal("0.000001"))
            return float(normalized)
        if isinstance(value, str):
            normalized = Decimal(value).quantize(Decimal("0.000001"))
            return float(normalized)
        raise TypeError(f"Unsupported coordinate value: {type(value)!r}")

    def to_dict(self) -> dict[str, Any]:
        return {
            "site_id": self.site_id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "vendor": self.vendor,
            "technology": self.technology,
            "power_source": self.power_source,
            "status": self.status,
            "region": self.region,
            "market": self.market,
            "cluster": self.cluster,
        }


@dataclass(slots=True)
class SiteGenerationScenario(BaseScenario[SiteRecord]):
    """Scenario configuration for site generation."""

    name: str
    description: str
    count: int = 1

    def get_name(self) -> str:
        return self.name

    def get_description(self) -> str:
        return self.description
