import asyncio

from app.synthetic_data.exporters.site_exporter import CsvExporter, JsonExporter
from app.synthetic_data.generators.alarm_generator import AlarmGenerator
from app.synthetic_data.models.alarm.alarm import Alarm, AlarmSeverity


def test_alarm_generator_creates_alarm_with_entity_reference() -> None:
    generator = AlarmGenerator(seed=5)
    alarm = asyncio.run(generator.generate_one(affected_entity_type="cell", affected_entity_id="cell-001"))

    assert isinstance(alarm, Alarm)
    assert alarm.affected_entity_type == "cell"
    assert alarm.affected_entity_id == "cell-001"
    assert alarm.severity in list(AlarmSeverity)


def test_alarm_generator_supports_multiple_alarms() -> None:
    generator = AlarmGenerator(seed=6)
    alarms = asyncio.run(generator.generate_many(count=3, affected_entity_type="sector", affected_entity_id="sector-001"))

    assert len(alarms) == 3
    assert all(alarm.affected_entity_type == "sector" for alarm in alarms)
    assert all(alarm.affected_entity_id == "sector-001" for alarm in alarms)


def test_alarm_exporters_produce_json_and_csv_payloads() -> None:
    generator = AlarmGenerator(seed=7)
    alarm = asyncio.run(generator.generate_one(affected_entity_type="site", affected_entity_id="site-123"))

    json_payload = asyncio.run(JsonExporter().export([alarm]))
    csv_payload = asyncio.run(CsvExporter().export([alarm]))

    assert '"title"' in json_payload
    assert 'title' in csv_payload
    assert alarm.title in csv_payload
