from app.schemas.health import HealthStatus


class HealthService:
    async def get_health(self) -> HealthStatus:
        return HealthStatus(status="ok", service="ai-ran-context-os")
