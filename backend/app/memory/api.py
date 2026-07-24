from fastapi import APIRouter, Query

from app.memory.models import MemoryCategory, MemoryEntry, MemoryQuery
from app.memory.services import MemoryService

router = APIRouter(prefix="/memory", tags=["memory"])
service = MemoryService()


@router.post("/store", response_model=MemoryEntry)
async def store_memory(payload: dict) -> MemoryEntry:
    entry = MemoryEntry(**payload)
    return service.store_entry(entry)


@router.get("/entity/{entity_id}", response_model=list[MemoryEntry])
async def get_memory_by_entity(entity_id: str) -> list[MemoryEntry]:
    return service.get_by_entity(entity_id)


@router.get("/history", response_model=list[MemoryEntry])
async def get_memory_history(
    entity_id: str | None = Query(default=None),
    entity_type: str | None = Query(default=None),
    incident_id: str | None = Query(default=None),
    policy_id: str | None = Query(default=None),
    start_time: str | None = Query(default=None),
    end_time: str | None = Query(default=None),
) -> list[MemoryEntry]:
    query = MemoryQuery(
        entity_id=entity_id,
        entity_type=entity_type,
        incident_id=incident_id,
        policy_id=policy_id,
        start_time=start_time,
        end_time=end_time,
    )
    return service.query(query)


@router.get("/summary", response_model=dict)
async def get_memory_summary(entity_id: str = Query(...), entity_type: str = Query(default="site")) -> dict[str, object]:
    return service.summarize(entity_id, entity_type).model_dump()
