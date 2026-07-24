from app.models.factories.canonical_factory import CanonicalModelFactory
from app.models.validation.service import CanonicalValidationService


def test_canonical_model_validation_accepts_valid_entity() -> None:
    entity = CanonicalModelFactory().create(
        "CanonicalTelemetry",
        {"source_system": "synthetic", "vendor": "Synthetic", "metric_name": "availability", "value": 99.9},
    )

    import asyncio

    asyncio.run(CanonicalValidationService().validate(entity))
    assert entity.entity_type == "canonical_telemetry"


def test_canonical_model_validation_rejects_invalid_priority_confidence() -> None:
    entity = CanonicalModelFactory().create(
        "CanonicalDecision",
        {"source_system": "synthetic", "vendor": "Synthetic", "confidence": 0.1, "business_priority": "P1"},
    )

    import asyncio

    try:
        asyncio.run(CanonicalValidationService().validate(entity))
    except ValueError as exc:
        assert "confidence" in str(exc)
    else:
        raise AssertionError("expected validation to fail")