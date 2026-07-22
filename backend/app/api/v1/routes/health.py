from fastapi import APIRouter, Depends

from app.schemas.health import HealthStatus
from app.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["health"])


def get_health_service() -> HealthService:
    return HealthService()


@router.get("", response_model=HealthStatus)
async def health_check(service: HealthService = Depends(get_health_service)) -> HealthStatus:
    return await service.get_health()
