import asyncio

from app.synthetic_data.exporters.site_exporter import CsvExporter, JsonExporter
from app.synthetic_data.generators.kpi_generator import KpiGenerator
from app.synthetic_data.models.kpi.kpi import KpiSeries


def test_kpi_generator_creates_hourly_series_for_cell() -> None:
    generator = KpiGenerator(seed=11)
    series = asyncio.run(generator.generate_one(cell_id="cell-001", interval="hourly", points=6))

    assert isinstance(series, KpiSeries)
    assert series.cell_id == "cell-001"
    assert series.interval == "hourly"
    assert len(series.timestamps) == 6
    assert len(series.metrics) == 10
    assert all(metric.value != 0 for metric in series.metrics)


def test_kpi_generator_supports_daily_and_weekly_intervals() -> None:
    generator = KpiGenerator(seed=22)
    daily = asyncio.run(generator.generate_one(cell_id="cell-002", interval="daily", points=3))
    weekly = asyncio.run(generator.generate_one(cell_id="cell-003", interval="weekly", points=2))

    assert daily.interval == "daily"
    assert weekly.interval == "weekly"
    assert len(daily.timestamps) == 3
    assert len(weekly.timestamps) == 2


def test_kpi_exporters_produce_json_and_csv_payloads() -> None:
    generator = KpiGenerator(seed=33)
    series = asyncio.run(generator.generate_one(cell_id="cell-004", interval="hourly", points=2))

    json_payload = asyncio.run(JsonExporter().export([series]))
    csv_payload = asyncio.run(CsvExporter().export([series]))

    assert '"cell_id"' in json_payload
    assert 'cell_id' in csv_payload
    assert 'RSRP' in json_payload
