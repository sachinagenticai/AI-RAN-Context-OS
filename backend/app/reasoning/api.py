import logging

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from app.reasoning.models import ReasoningRequest, ReasoningResponse
from app.reasoning.services import ReasoningEngine
from app.services.openai_service import OpenAIContextService, OpenAIServiceError

router = APIRouter(prefix="/reasoning", tags=["reasoning"])
engine = ReasoningEngine()
openai_service = OpenAIContextService()
logger = logging.getLogger(__name__)


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


def _format_context_for_llm(request: ReasoningRequestBody) -> str:
    """Format the investigation context for OpenAI analysis."""
    lines = [
        f"Entity: {request.entity_id} ({request.entity_type})",
        "",
        "Context Information:",
    ]

    # Add context fields
    context = request.context or {}
    if context:
        for key, value in context.items():
            lines.append(f"  {key}: {value}")

    # Add correlation info
    correlation = request.correlation or {}
    if correlation:
        lines.append("")
        lines.append("Correlation Analysis:")
        for key, value in correlation.items():
            lines.append(f"  {key}: {value}")

    # Add evidence
    evidence = request.evidence or {}
    if evidence:
        lines.append("")
        lines.append("Evidence:")
        for key, value in evidence.items():
            lines.append(f"  {key}: {value}")

    # Add business impact
    business_impact = request.business_impact or {}
    if business_impact:
        lines.append("")
        lines.append("Business Impact:")
        for key, value in business_impact.items():
            lines.append(f"  {key}: {value}")

    return "\n".join(lines)


@router.post("/analyze", response_model=ReasoningResponse)
async def analyze_reasoning(request_body: ReasoningRequestBody) -> ReasoningResponse:
    request = ReasoningRequest(**request_body.model_dump())

    # Generate deterministic reasoning (always returned)
    reasoning_response = engine.reason(request)

    # Enhance with OpenAI analysis (optional - graceful fallback)
    try:
        context_str = _format_context_for_llm(request_body)
        llm_response = openai_service.generate_context_analysis(context_str)

        # Populate optional fields with LLM response
        reasoning_response.llm_executive_summary = llm_response.executive_summary
        reasoning_response.llm_root_cause_summary = llm_response.root_cause_summary
        reasoning_response.llm_recommended_actions = llm_response.recommended_actions
        reasoning_response.llm_risk_assessment = llm_response.risk_assessment

        logger.info(f"OpenAI enrichment successful for entity {request.entity_id}")
    except OpenAIServiceError as e:
        logger.warning(f"OpenAI enrichment failed: {e}. Returning deterministic response.")
    except Exception as e:
        logger.error(f"Unexpected error during OpenAI enrichment: {e}")

    return reasoning_response
