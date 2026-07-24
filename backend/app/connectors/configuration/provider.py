from __future__ import annotations

from typing import Any


class InMemoryConfigurationProvider:
    def __init__(self, configuration: dict[str, Any] | None = None) -> None:
        self._configuration = configuration or {"plugins": []}

    async def load(self) -> dict[str, Any]:
        return dict(self._configuration)