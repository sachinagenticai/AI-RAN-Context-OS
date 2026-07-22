from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from app.reasoning.models import ReasoningRequest, ReasoningResponse
from app.reasoning.services import ReasoningEngine

router = APIRouter(prefix="/reasoning", tags=["reasoning"])
engine = ReasoningEngine()


class ReasoningRequestBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str = Field(min_length=1)
    entity_type: str = Field(min_length=1)
    context: dict = Field(default_factory=dict)
    correlation: dict = Field(default_factory=dict)
    evidence: dict = Field(default_factory=dict)
    business_impact: dict = Field(default_factory=dict)
    timeline: dict = Field(default_factory=dict)
    quality: dict = Field(default_factory=dict)


@router.post("/analyze", response_model=ReasoningResponse)
async def analyze_reasoning(request_body: ReasoningRequestBody) -> ReasoningResponse:
    request = ReasoningRequest(**request_body.model_dump())
    return engine.reason(request)
