from __future__ import annotations

from typing import Any

from app.models.factories.canonical_factory import CanonicalModelFactory


class CanonicalEntityBuilder:
    def __init__(self, model_type: str, factory: CanonicalModelFactory | None = None) -> None:
        self._model_type = model_type
        self._factory = factory or CanonicalModelFactory()
        self._payload: dict[str, Any] = {}

    def with_field(self, key: str, value: Any) -> "CanonicalEntityBuilder":
        self._payload[key] = value
        return self

    def with_fields(self, **kwargs: Any) -> "CanonicalEntityBuilder":
        self._payload.update(kwargs)
        return self

    def build(self):
        return self._factory.create(self._model_type, self._payload)