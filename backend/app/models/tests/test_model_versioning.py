import asyncio

from app.models.versioning.service import CanonicalVersioningService


def test_versioning_reports_compatibility_and_migrates_payloads() -> None:
    service = CanonicalVersioningService()

    migrated = asyncio.run(service.migrate({"id": "1", "version": "0.9.0"}))
    compatible = asyncio.run(service.is_backward_compatible("0.9.0"))

    assert migrated["version"] == "1.0.0"
    assert migrated["metadata"]["migrated"] is True
    assert compatible is True