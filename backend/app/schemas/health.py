from pydantic import BaseModel, Field


class HealthStatus(BaseModel):
    status: str = Field(default="ok")
    service: str = Field(default="ai-ran-context-os")
