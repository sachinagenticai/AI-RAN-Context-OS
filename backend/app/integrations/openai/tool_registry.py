from __future__ import annotations

from typing import Any, Callable


class ToolRegistry:
    """Registers callable tools for the Responses API."""

    def __init__(self) -> None:
        self._tools: dict[str, Callable[..., Any]] = {}

    def register(self, name: str, handler: Callable[..., Any]) -> None:
        self._tools[name] = handler

    def get_tools(self) -> list[dict[str, Any]]:
        return [{"type": "function", "name": name} for name in sorted(self._tools)]

    def get_handler(self, name: str) -> Callable[..., Any]:
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' not registered")
        return self._tools[name]
