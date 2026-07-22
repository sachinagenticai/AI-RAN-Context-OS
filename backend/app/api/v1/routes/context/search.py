from fastapi import APIRouter, Depends, Query

from app.schemas.context_search import ContextSearchRequest, ContextSearchResponse
from app.services.context_search_service import ContextSearchService

router = APIRouter(prefix="/context", tags=["context"])


def get_context_search_service() -> ContextSearchService:
    return ContextSearchService()


@router.get("/search", response_model=ContextSearchResponse)
async def search_contexts(
    technology: str | None = Query(default=None),
    site: str | None = Query(default=None),
    cell: str | None = Query(default=None),
    alarm: str | None = Query(default=None),
    region: str | None = Query(default=None),
    market: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    service: ContextSearchService = Depends(get_context_search_service),
) -> ContextSearchResponse:
    request = ContextSearchRequest(
        technology=technology,
        site=site,
        cell=cell,
        alarm=alarm,
        region=region,
        market=market,
        severity=severity,
        page=page,
        page_size=page_size,
    )
    return service.search(request)
