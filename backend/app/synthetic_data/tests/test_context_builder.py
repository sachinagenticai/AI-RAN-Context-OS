from app.synthetic_data.services.context_builder import ContextBuilder


def test_context_builder_merges_inputs_into_context_object() -> None:
    builder = ContextBuilder()

    context = builder.build_context(
        entity_id="site-001",
        entity_type="site",
        inventory={"technology": "5G", "carrier": "Operator A", "band": "n78", "sector_count": 3},
        kpis={"avg_rsrp": -105, "avg_sinr": 12, "availability": 0.99, "throughput": 250},
        alarms={"count": 2, "severity": "Major", "types": ["Power Alarm", "Interference"]},
        weather={"temperature_c": 28, "wind_kph": 12, "condition": "clear"},
    )

    assert context.entity_id == "site-001"
    assert context.entity_type == "site"
    assert context.inventory_summary["technology"] == "5G"
    assert context.kpi_summary["avg_rsrp"] == -105
    assert context.alarm_summary["severity"] == "Major"
    assert context.weather_summary["condition"] == "clear"
    assert "Signal quality is below expected threshold" in context.insights
    assert "High-severity alarms require attention" in context.insights
