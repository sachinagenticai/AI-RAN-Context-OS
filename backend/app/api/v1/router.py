from fastapi import APIRouter

from app.api.v1.routes.context.search import router as context_router
from app.api.v1.routes.context.intelligence import router as intelligence_router
from app.api.v1.routes.health import router as health_router
from app.connectors.api.router import router as connectors_router
from app.events.api.router import router as events_router
from app.kernel.kernel import router as kernel_router
from app.memory.api import router as memory_router
from app.models.api.router import router as models_router
from app.policy.api import router as policy_router
from app.reasoning.api import router as reasoning_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(connectors_router)
api_router.include_router(models_router)
api_router.include_router(events_router)
api_router.include_router(context_router)
api_router.include_router(intelligence_router)
api_router.include_router(kernel_router)
api_router.include_router(reasoning_router)
api_router.include_router(policy_router)
api_router.include_router(memory_router)
