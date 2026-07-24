import asyncio

from app.models.factories.canonical_factory import CanonicalModelFactory
from app.models.serializers.service import CanonicalSerializationService


def test_canonical_serialization_supports_json_yaml_and_dict() -> None:
    entity = CanonicalModelFactory().create(
        "CanonicalAlarm",
        {"source_system": "synthetic", "vendor": "Synthetic", "metric_name": "alarm_count", "value": 3},
    )
    serializer = CanonicalSerializationService()

    payload = asyncio.run(serializer.to_dict(entity))
    json_output = asyncio.run(serializer.to_json(entity))
    yaml_output = asyncio.run(serializer.to_yaml(entity))

    assert payload["entity_type"] == "canonical_alarm"
    assert "canonical_alarm" in json_output
    assert "canonical_alarm" in yaml_output