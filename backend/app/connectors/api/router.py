from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.connectors.exceptions.connector_exceptions import ConnectorError
from app.connectors.manager.connector_manager import ConnectorManager, build_connector_manager
from app.connectors.schemas.connector_schemas import (
    ConnectorActionRequest,
    ConnectorCapabilityCatalog,
    ConnectorDetail,
    ConnectorDiscoveryResponse,
    ConnectorHealth,
    ConnectorRecord,
    ConnectorRegistrationRequest,
    ConnectorRuntimeStatus,
)


router = APIRouter(prefix="/connectors", tags=["connectors"])
connector_manager = build_connector_manager()


def get_connector_manager() -> ConnectorManager:
    return connector_manager


@router.get("", response_model=list[ConnectorRecord])
async def list_connectors(manager: ConnectorManager = Depends(get_connector_manager)) -> list[ConnectorRecord]:
    return await manager.list_connectors()


@router.post("/register", response_model=ConnectorDetail)
async def register_connector(
    request: ConnectorRegistrationRequest,
    manager: ConnectorManager = Depends(get_connector_manager),
) -> ConnectorDetail:
    try:
        return await manager.register_connector(request)
    except ConnectorError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/start", response_model=ConnectorRuntimeStatus)
async def start_connector(
    request: ConnectorActionRequest,
    manager: ConnectorManager = Depends(get_connector_manager),
) -> ConnectorRuntimeStatus:
    try:
        return await manager.start_connector(request)
    except ConnectorError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/stop", response_model=ConnectorRuntimeStatus)
async def stop_connector(
    request: ConnectorActionRequest,
    manager: ConnectorManager = Depends(get_connector_manager),
) -> ConnectorRuntimeStatus:
    try:
        return await manager.stop_connector(request)
    except ConnectorError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/restart", response_model=ConnectorRuntimeStatus)
async def restart_connector(
    request: ConnectorActionRequest,
    manager: ConnectorManager = Depends(get_connector_manager),
) -> ConnectorRuntimeStatus:
    try:
        return await manager.restart_connector(request)
    except ConnectorError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/status", response_model=list[ConnectorRuntimeStatus])
async def connector_status(
    connector_id: str | None = Query(default=None),
    manager: ConnectorManager = Depends(get_connector_manager),
) -> list[ConnectorRuntimeStatus]:
    try:
        return await manager.statuses(connector_id)
    except ConnectorError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/health", response_model=list[ConnectorHealth])
async def connector_health(
    connector_id: str | None = Query(default=None),
    manager: ConnectorManager = Depends(get_connector_manager),
) -> list[ConnectorHealth]:
    try:
        return await manager.health(connector_id)
    except ConnectorError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/discover", response_model=ConnectorDiscoveryResponse)
async def discover_connectors(manager: ConnectorManager = Depends(get_connector_manager)) -> ConnectorDiscoveryResponse:
    return await manager.discover()


@router.get("/capabilities", response_model=ConnectorCapabilityCatalog)
async def connector_capabilities(manager: ConnectorManager = Depends(get_connector_manager)) -> ConnectorCapabilityCatalog:
    return await manager.capabilities()


@router.get("/{connector_id}", response_model=ConnectorDetail)
async def get_connector(connector_id: str, manager: ConnectorManager = Depends(get_connector_manager)) -> ConnectorDetail:
    try:
        return await manager.get_connector(connector_id)
    except ConnectorError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc