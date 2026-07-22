from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ContextSearchRequest(BaseModel):
    technology: str | None = None
    site: str | None = None
    cell: str | None = None
    alarm: str | None = None
    region: str | None = None
    market: str | None = None
    severity: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)


class ContextSearchItem(BaseModel):
    id: str
    site: str | None = None
    cell: str | None = None
    alarm: str | None = None
    region: str | None = None
    market: str | None = None
    technology: str | None = None
    severity: str | None = None
    context: dict[str, Any] = Field(default_factory=dict)


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class ContextSearchResponse(BaseModel):
    items: list[ContextSearchItem]
    pagination: PaginationMeta
