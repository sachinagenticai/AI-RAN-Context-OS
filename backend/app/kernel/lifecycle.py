from __future__ import annotations

import importlib
from datetime import datetime, timezone

from app.kernel.registry import KernelRuntimeModule, ModuleRegistry


class KernelLifecycleManager:
    def __init__(self) -> None:
        self.state = "created"
        self.started_at: str | None = None
        self.stopped_at: str | None = None
        self.loaded_plugins: list[str] = []

    def start(self, *, registry: ModuleRegistry, plugin_paths: list[str] | None = None) -> None:
        self.state = "starting"
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.stopped_at = None

        for plugin_path in plugin_paths or []:
            loaded_names = self._load_plugin(plugin_path, registry)
            self.loaded_plugins.extend(loaded_names)

        registry.validate_dependencies()
        self.state = "running"

    def shutdown(self) -> None:
        self.state = "stopped"
        self.stopped_at = datetime.now(timezone.utc).isoformat()

    def _load_plugin(self, plugin_path: str, registry: ModuleRegistry) -> list[str]:
        module_name, _, attribute_name = plugin_path.partition(":")
        attribute_name = attribute_name or "register_plugin"
        plugin_module = importlib.import_module(module_name)
        plugin_factory = getattr(plugin_module, attribute_name)
        loaded = plugin_factory()
        modules = loaded if isinstance(loaded, list) else [loaded]

        registered_names: list[str] = []
        for module in modules:
            if not isinstance(module, KernelRuntimeModule):
                raise TypeError(f"Plugin '{plugin_path}' returned an invalid module instance")
            registry.register(module)
            registered_names.append(module.name)
        return registered_names
