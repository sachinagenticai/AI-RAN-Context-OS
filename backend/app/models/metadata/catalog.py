from __future__ import annotations

from typing import Any

from app.models.canonical.ai.models import *
from app.models.canonical.business.models import *
from app.models.canonical.events.models import *
from app.models.canonical.governance.models import *
from app.models.canonical.infrastructure.models import *
from app.models.canonical.memory.models import *
from app.models.canonical.monitoring.models import *
from app.models.canonical.operations.models import *
from app.models.canonical.security.models import *
from app.models.canonical.topology.models import *
from app.models.canonical.workflow.models import *


class CanonicalModelCatalog:
    def __init__(self) -> None:
        self._models: dict[str, type] = {
            name: value
            for name, value in globals().items()
            if isinstance(value, type) and name.startswith("Canonical")
        }

    def model_types(self) -> list[str]:
        return sorted(self._models)

    def get_model(self, model_type: str) -> type:
        return self._models[model_type]

    def metadata(self, model_type: str) -> dict[str, Any]:
        model = self.get_model(model_type)
        return {
            "model_type": model_type,
            "entity_type": getattr(model, "entity_type", model_type.lower()),
            "fields": sorted(model.model_fields.keys()),
        }

    def schema(self, model_type: str) -> dict[str, Any]:
        return self.get_model(model_type).model_json_schema()