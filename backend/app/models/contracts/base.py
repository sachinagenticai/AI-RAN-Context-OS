from __future__ import annotations

from typing import Any, Protocol


class CanonicalEntityContract(Protocol):
    id: str
    source_system: str
    vendor: str
    timestamp: str
    version: str
    correlation_id: str
    tenant_id: str
    status: str


class SerializableContract(Protocol):
    def to_dict(self) -> dict[str, Any]: ...
    def to_json(self) -> str: ...
    def to_yaml(self) -> str: ...


class VersionableContract(Protocol):
    def model_version(self) -> str: ...


class ValidatableContract(Protocol):
    def validate_business_rules(self) -> None: ...