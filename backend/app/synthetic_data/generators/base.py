from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

from app.synthetic_data.models.base import BaseScenario

T = TypeVar("T")


class BaseGenerator(ABC, Generic[T]):
    """Abstract contract for all synthetic data generators.

    Implementations should be responsible only for producing domain objects or
    payloads for a specific scenario, while the orchestration remains separate.
    """

    @abstractmethod
    async def generate(self, scenario: BaseScenario[T]) -> list[T]:
        """Generate a collection of records for the supplied scenario."""

    @abstractmethod
    async def generate_one(self, scenario: BaseScenario[T]) -> T:
        """Generate a single record for the supplied scenario."""


class BaseGeneratorFactory(ABC):
    """Abstract factory for selecting the appropriate generator implementation."""

    @abstractmethod
    def create(self, name: str) -> BaseGenerator[Any]:
        """Create a generator for the supplied registration name."""
