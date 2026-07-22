from __future__ import annotations

from typing import Any

from app.synthetic_data.models.context.context import ContextObject


class ContextBuilder:
    """Build a composite telecom context from inventory, KPI, alarm, and weather inputs."""

    def build_context(
        self,
        *,
        entity_id: str,
        entity_type: str,
        inventory: dict[str, Any] | None = None,
        kpis: dict[str, Any] | None = None,
        alarms: dict[str, Any] | None = None,
        weather: dict[str, Any] | None = None,
    ) -> ContextObject:
        inventory = inventory or {}
        kpis = kpis or {}
        alarms = alarms or {}
        weather = weather or {}

        insights = self._derive_insights(inventory, kpis, alarms, weather)

        return ContextObject(
            entity_id=entity_id,
            entity_type=entity_type,
            inventory_summary=self._summarize_inventory(inventory),
            kpi_summary=self._summarize_kpis(kpis),
            alarm_summary=self._summarize_alarms(alarms),
            weather_summary=self._summarize_weather(weather),
            insights=insights,
        )

    def _summarize_inventory(self, inventory: dict[str, Any]) -> dict[str, Any]:
        return {
            "technology": inventory.get("technology"),
            "carrier": inventory.get("carrier"),
            "band": inventory.get("band"),
            "sector_count": inventory.get("sector_count"),
        }

    def _summarize_kpis(self, kpis: dict[str, Any]) -> dict[str, Any]:
        if not kpis:
            return {}
        return {
            "avg_rsrp": kpis.get("avg_rsrp"),
            "avg_sinr": kpis.get("avg_sinr"),
            "availability": kpis.get("availability"),
            "throughput": kpis.get("throughput"),
        }

    def _summarize_alarms(self, alarms: dict[str, Any]) -> dict[str, Any]:
        if not alarms:
            return {}
        return {
            "count": alarms.get("count", len(alarms.get("items", []))),
            "severity": alarms.get("severity"),
            "types": alarms.get("types"),
        }

    def _summarize_weather(self, weather: dict[str, Any]) -> dict[str, Any]:
        return {
            "temperature_c": weather.get("temperature_c"),
            "wind_kph": weather.get("wind_kph"),
            "condition": weather.get("condition"),
        }

    def _derive_insights(
        self,
        inventory: dict[str, Any],
        kpis: dict[str, Any],
        alarms: dict[str, Any],
        weather: dict[str, Any],
    ) -> list[str]:
        insights: list[str] = []

        if inventory.get("technology"):
            insights.append(f"Inventory reports {inventory['technology']} technology")
        if kpis.get("avg_rsrp") is not None and kpis.get("avg_rsrp") < -100:
            insights.append("Signal quality is below expected threshold")
        if alarms.get("severity") in {"Critical", "Major"}:
            insights.append("High-severity alarms require attention")
        if weather.get("condition"):
            insights.append(f"Current weather condition is {weather['condition']}")
        return insights
