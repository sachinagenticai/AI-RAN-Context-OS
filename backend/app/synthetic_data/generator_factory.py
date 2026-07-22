from __future__ import annotations

from typing import Any

from app.synthetic_data.generators.base import BaseGenerator, BaseGeneratorFactory
from app.synthetic_data.exceptions import ConfigurationError


class DefaultGeneratorFactory(BaseGeneratorFactory):
    """Default factory implementation for resolving generators.

    The foundation layer intentionally keeps this dependency-injection friendly
    and open for extension via registration-based or provider-based patterns.
    """

    def __init__(self, registry: dict[str, type[BaseGenerator[Any]]] | None = None) -> None:
        self._registry = registry or {}

    def register(self, name: str, generator_cls: type[BaseGenerator[Any]]) -> None:
        """Register a generator implementation by name."""
        self._registry[name] = generator_cls

    def create(self, name: str) -> BaseGenerator[Any]:
        """Create a generator instance for the supplied name."""
        generator_cls = self._registry.get(name)
        if generator_cls is None:
            raise ConfigurationError(f"No generator registered for '{name}'.")
        return generator_cls()
