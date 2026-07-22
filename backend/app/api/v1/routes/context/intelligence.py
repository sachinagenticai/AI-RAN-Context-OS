from fastapi import APIRouter, Query

from app.synthetic_data.services.context_intelligence import ContextIntelligenceEngine

router = APIRouter(prefix="/context", tags=["context-intelligence"])
engine = ContextIntelligenceEngine()


@router.get("/intelligence")
async def get_context_intelligence(
    entity_id: str = Query(...),
    entity_type: str = Query(default="site"),
) -> dict[str, object]:
    return engine.build_context_intelligence(entity_id=entity_id, entity_type=entity_type)


@router.get("/evidence")
async def get_context_evidence(
    entity_id: str = Query(...),
    entity_type: str = Query(default="site"),
) -> dict[str, object]:
    return engine.build_context_intelligence(entity_id=entity_id, entity_type=entity_type)


@router.get("/timeline")
async def get_context_timeline(
    entity_id: str = Query(...),
    entity_type: str = Query(default="site"),
) -> dict[str, object]:
    return engine.build_context_intelligence(entity_id=entity_id, entity_type=entity_type)


@router.get("/business-impact")
async def get_business_impact(
    entity_id: str = Query(...),
    entity_type: str = Query(default="site"),
) -> dict[str, object]:
    return engine.build_context_intelligence(entity_id=entity_id, entity_type=entity_type)


@router.get("/quality")
async def get_context_quality(
    entity_id: str = Query(...),
    entity_type: str = Query(default="site"),
) -> dict[str, object]:
    return engine.build_context_intelligence(entity_id=entity_id, entity_type=entity_type)
