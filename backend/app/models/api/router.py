from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.builders.entity_builder import CanonicalEntityBuilder
from app.models.factories.canonical_factory import CanonicalModelFactory
from app.models.metadata.catalog import CanonicalModelCatalog
from app.models.repository.model_repository import CanonicalModelRepository
from app.models.schemas.api import ModelMetadataResponse, ModelValidateRequest, ModelValidateResponse
from app.models.validation.service import CanonicalValidationService
from app.models.versioning.service import CanonicalVersioningService


router = APIRouter(prefix="/models", tags=["models"])

catalog = CanonicalModelCatalog()
repository = CanonicalModelRepository(catalog)
factory = CanonicalModelFactory(catalog)
validator = CanonicalValidationService()
versioning = CanonicalVersioningService()


def get_repository() -> CanonicalModelRepository:
    return repository


@router.get("", response_model=list[str])
async def list_models(repo: CanonicalModelRepository = Depends(get_repository)) -> list[str]:
    return await repo.list_types()


@router.get("/types", response_model=list[str])
async def list_model_types(repo: CanonicalModelRepository = Depends(get_repository)) -> list[str]:
    return await repo.list_types()


@router.post("/validate", response_model=ModelValidateResponse)
async def validate_model(request: ModelValidateRequest) -> ModelValidateResponse:
    try:
        entity = factory.create(request.model_type, request.payload)
        await validator.validate(entity)
        return ModelValidateResponse(model_type=request.model_type, valid=True, normalized=entity.to_dict())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/schema", response_model=dict)
async def get_model_schema(model_type: str = Query(...), repo: CanonicalModelRepository = Depends(get_repository)) -> dict:
    try:
        return await repo.schema(model_type)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/version", response_model=dict)
async def get_model_version(model_type: str = Query(...), repo: CanonicalModelRepository = Depends(get_repository)) -> dict:
    try:
        schema = await repo.schema(model_type)
        return {"model_type": model_type, "version": schema["properties"]["version"].get("default", await versioning.get_version())}
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/metadata", response_model=ModelMetadataResponse)
async def get_model_metadata(model_type: str = Query(...), repo: CanonicalModelRepository = Depends(get_repository)) -> ModelMetadataResponse:
    try:
        schema = await repo.schema(model_type)
        metadata = await repo.metadata(model_type)
        return ModelMetadataResponse(
            model_type=model_type,
            version=schema["properties"]["version"].get("default", await versioning.get_version()),
            schema_definition=schema,
            metadata=metadata,
        )
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/builder", response_model=dict)
async def build_sample_model(model_type: str = Query(...)) -> dict:
    try:
        entity = CanonicalEntityBuilder(model_type).with_field("source_system", "builder").build()
        return entity.to_dict()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc