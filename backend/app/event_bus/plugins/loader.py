from __future__ import annotations

import importlib
import inspect

from app.event_bus.exceptions import EventBusPluginError


class EventBusPluginLoader:
    async def load(self, bus: object, plugin_paths: list[str]) -> list[str]:
        loaded: list[str] = []
        for plugin_path in plugin_paths:
            loaded.extend(await self._load_one(bus, plugin_path))
        return loaded

    async def _load_one(self, bus: object, plugin_path: str) -> list[str]:
        module_name, _, attribute_name = plugin_path.partition(":")
        attribute_name = attribute_name or "register_plugins"
        try:
            module = importlib.import_module(module_name)
            factory = getattr(module, attribute_name)
            result = factory(bus)
            if inspect.isawaitable(result):
                result = await result
            if result is None:
                return [plugin_path]
            if isinstance(result, list):
                return [str(item) for item in result]
            return [str(result)]
        except Exception as exc:
            raise EventBusPluginError(str(exc)) from exc