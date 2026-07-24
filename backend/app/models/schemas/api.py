from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ModelValidateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", protected_namespaces=())

    model_type: str = Field(min_length=1)
    payload: dict[str, Any] = Field(default_factory=dict)


class ModelValidateResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", protected_namespaces=())

    model_type: str
    valid: bool
    normalized: dict[str, Any] = Field(default_factory=dict)


class ModelMetadataResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", protected_namespaces=(), populate_by_name=True)

    model_type: str
    version: str
    schema_definition: dict[str, Any] = Field(default_factory=dict, alias="schema")
    metadata: dict[str, Any] = Field(default_factory=dict)