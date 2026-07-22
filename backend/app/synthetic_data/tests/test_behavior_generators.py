import asyncio

from app.synthetic_data.exporters.site_exporter import CsvExporter, JsonExporter
from app.synthetic_data.generators.alarm_generator import AlarmGenerator
from app.synthetic_data.generators.energy_generator import EnergyGenerator
from app.synthetic_data.generators.kpi_generator import KpiGenerator
from app.synthetic_data.generators.maintenance_generator import MaintenanceGenerator
from app.synthetic_data.generators.traffic_generator import TrafficGenerator
from app.synthetic_data.generators.weather_generator import WeatherGenerator
from app.synthetic_data.models.alarm.alarm import Alarm
from app.synthetic_data.models.kpi.kpi import KpiSeries
from app.synthetic_data.models.behavior.energy import EnergyReading
from app.synthetic_data.models.behavior.maintenance import MaintenanceEvent
from app.synthetic_data.models.behavior.traffic import TrafficProfile
from app.synthetic_data.models.behavior.weather import WeatherEvent


def test_kpi_generator_supports_site_cell_sector_references_and_horizons() -> None:
    generator = KpiGenerator(seed=11)
    series = asyncio.run(
        generator.generate_series(
            site_id="site-100",
            cell_id="cell-100",
            sector_id="sector-A",
            horizon="24h",
            points=6,
        )
    )

    assert isinstance(series, KpiSeries)
    assert series.site_id == "site-100"
    assert series.cell_id == "cell-100"
    assert series.sector_id == "sector-A"
    assert series.horizon == "24h"
    assert len(series.timestamps) == 6
    assert any(metric.name == "RSRP" for metric in series.metrics)


def test_alarm_generator_produces_site_cell_sector_references() -> None:
    generator = AlarmGenerator(seed=23)
    alarm = asyncio.run(
        generator.generate_one(
            affected_entity_type="cell",
            affected_entity_id="cell-200",
            site_id="site-200",
            cell_id="cell-200",
            sector_id="sector-B",
        )
    )

    assert isinstance(alarm, Alarm)
    assert alarm.site_id == "site-200"
    assert alarm.cell_id == "cell-200"
    assert alarm.sector_id == "sector-B"


def test_weather_generator_builds_region_market_cluster_events() -> None:
    generator = WeatherGenerator(seed=31)
    events = asyncio.run(
        generator.generate_series(
            region_id="region-1",
            market_id="market-1",
            cluster_id="cluster-1",
            horizon="7d",
            points=3,
        )
    )

    assert len(events) == 3
    assert all(isinstance(event, WeatherEvent) for event in events)
    assert all(event.region_id == "region-1" for event in events)
    assert all(event.market_id == "market-1" for event in events)
    assert all(event.cluster_id == "cluster-1" for event in events)


def test_traffic_generator_emits_historical_profiles() -> None:
    generator = TrafficGenerator(seed=41)
    profiles = asyncio.run(
        generator.generate_series(
            site_id="site-300",
            cell_id="cell-300",
            sector_id="sector-C",
            horizon="30d",
            points=4,
        )
    )

    assert len(profiles) == 4
    assert all(isinstance(profile, TrafficProfile) for profile in profiles)
    assert all(profile.site_id == "site-300" for profile in profiles)


def test_energy_generator_and_maintenance_generator_export_correctly() -> None:
    energy_generator = EnergyGenerator(seed=51)
    maintenance_generator = MaintenanceGenerator(seed=61)

    reading = asyncio.run(energy_generator.generate_one(site_id="site-400", cell_id="cell-400"))
    maintenance = asyncio.run(maintenance_generator.generate_one(site_id="site-400", cell_id="cell-400", sector_id="sector-A"))

    assert isinstance(reading, EnergyReading)
    assert isinstance(maintenance, MaintenanceEvent)

    energy_json = asyncio.run(JsonExporter().export([reading]))
    energy_csv = asyncio.run(CsvExporter().export([reading]))
    maintenance_json = asyncio.run(JsonExporter().export([maintenance]))

    assert '"site_id"' in energy_json
    assert 'site_id' in energy_csv
    assert '"title"' in maintenance_json
