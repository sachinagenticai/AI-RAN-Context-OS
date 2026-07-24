from app.memory.models import MemoryCategory, MemoryEntry, MemoryQuery
from app.memory.services import MemoryService


def test_memory_service_stores_and_retrieves_entries() -> None:
    service = MemoryService()
    entry = MemoryEntry(
        id="mem-1",
        entity_id="site-001",
        entity_type="site",
        category=MemoryCategory.OPERATIONAL,
        payload={"alarm": "high"},
        incident_id="inc-1",
    )

    stored = service.store_entry(entry)
    results = service.query(MemoryQuery(entity_id="site-001"))

    assert stored.id == "mem-1"
    assert results
    assert results[0].entity_id == "site-001"
