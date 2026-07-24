from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class KernelRuntimeModule(Protocol):
    name: str
    version: str
    capabilities: tuple[str, ...]
    dependencies: tuple[str, ...]

    def execute(self, context: Any) -> dict[str, Any]:
        ...

    def healthcheck(self) -> dict[str, Any]:
        ...


@dataclass(frozen=True, slots=True)
class ModuleDescriptor:
    name: str
    version: str
    capabilities: tuple[str, ...]
    dependencies: tuple[str, ...]


class CapabilityRegistry:
    def __init__(self) -> None:
        self._capabilities: dict[str, set[str]] = {}

    def register(self, module_name: str, capabilities: tuple[str, ...]) -> None:
        for capability in capabilities:
            self._capabilities.setdefault(capability, set()).add(module_name)

    def discover(self, capability: str) -> list[str]:
        return sorted(self._capabilities.get(capability, set()))


class ModuleRegistry:
    def __init__(self) -> None:
        self._modules: dict[str, KernelRuntimeModule] = {}
        self.capabilities = CapabilityRegistry()

    def register(self, module: KernelRuntimeModule) -> None:
        if module.name in self._modules:
            raise ValueError(f"Module '{module.name}' is already registered")
        self._modules[module.name] = module
        self.capabilities.register(module.name, module.capabilities)

    def get_module(self, name: str) -> KernelRuntimeModule:
        if name not in self._modules:
            raise KeyError(f"Module '{name}' is not registered")
        return self._modules[name]

    def list_modules(self) -> list[ModuleDescriptor]:
        return [
            ModuleDescriptor(
                name=module.name,
                version=module.version,
                capabilities=module.capabilities,
                dependencies=module.dependencies,
            )
            for module in sorted(self._modules.values(), key=lambda item: item.name)
        ]

    def discover_modules(self, capability: str | None = None) -> list[ModuleDescriptor]:
        if capability is None:
            return self.list_modules()
        names = set(self.capabilities.discover(capability))
        return [descriptor for descriptor in self.list_modules() if descriptor.name in names]

    def validate_dependencies(self) -> None:
        for module in self._modules.values():
            for dependency in module.dependencies:
                if dependency not in self._modules:
                    raise ValueError(f"Module '{module.name}' depends on missing module '{dependency}'")
