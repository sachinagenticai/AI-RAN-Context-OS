from fastapi import APIRouter, Query

from app.policy.models import PolicyResult, PolicyVersion
from app.policy.services import PolicyEvaluationEngine

router = APIRouter(prefix="/policy", tags=["policy"])
engine = PolicyEvaluationEngine()


@router.post("/evaluate", response_model=PolicyResult)
async def evaluate_policy(payload: dict) -> PolicyResult:
    return engine.evaluate(payload, request_id="req-policy")


@router.get("", response_model=PolicyVersion)
async def list_policies() -> PolicyVersion:
    return engine.list_policies()


@router.get("/version", response_model=dict)
async def get_policy_version() -> dict[str, str]:
    return {"version": engine.get_latest_version()}
