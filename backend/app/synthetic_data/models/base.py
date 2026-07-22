from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

T = TypeVar("T")


class BaseModel(ABC, Generic[T]):
    """Abstract base class for all synthetic-data models.

    This provides a uniform contract for data containers that may later be
    specialized into telecom-specific entities without introducing coupling.
    """

    @abstractmethod
    def to_dict(self) -> dict[str, Any]:
        """Serialize the model into a dictionary payload."""


class BaseScenario(ABC, Generic[T]):
    """Abstract base class for scenario definitions.

    Scenarios represent reusable generation contexts and should remain free of
    telecom-specific entity concerns in this foundation layer.
    """

    @abstractmethod
    def get_name(self) -> str:
        """Return the scenario name."""

    @abstractmethod
    def get_description(self) -> str:
        """Return the scenario description."""
