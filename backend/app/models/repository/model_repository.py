from __future__ import annotations

from app.models.metadata.catalog import CanonicalModelCatalog


class CanonicalModelRepository:
    def __init__(self, catalog: CanonicalModelCatalog | None = None) -> None:
        self._catalog = catalog or CanonicalModelCatalog()

    async def list_types(self) -> list[str]:
        return self._catalog.model_types()

    async def schema(self, model_type: str) -> dict[str, object]:
        return self._catalog.schema(model_type)

    async def metadata(self, model_type: str) -> dict[str, object]:
        return self._catalog.metadata(model_type)