from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

from app.synthetic_data.models.base import BaseScenario

T = TypeVar("T")


class BaseService(ABC, Generic[T]):
    """Abstract orchestration service for synthetic data workflows.

    Concrete services should coordinate configuration, validation, generation,
    and export without embedding domain-specific logic in this base layer.
    """

    @abstractmethod
    async def execute(self, scenario: BaseScenario[T]) -> list[T]:
        """Execute the workflow defined by the supplied scenario."""


class BaseWorkflowService(ABC):
    """Abstract workflow service for process composition and dependency wiring."""

    @abstractmethod
    async def run(self, scenario: BaseScenario[Any]) -> Any:
        """Run the workflow for a scenario and return a structured result."""
