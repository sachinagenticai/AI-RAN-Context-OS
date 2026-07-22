from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

T = TypeVar("T")


class BaseValidator(ABC, Generic[T]):
    """Abstract contract for validating generated or exported content.

    Validators are intentionally separated from generation to preserve the
    Single Responsibility Principle and enable unit testing in isolation.
    """

    @abstractmethod
    def validate(self, value: T) -> bool:
        """Validate the supplied value and return True when valid."""

    @abstractmethod
    def validate_many(self, values: list[T]) -> list[bool]:
        """Validate a collection of values and return their validity status."""


class BaseSchemaValidator(ABC):
    """Abstract adapter for schema-based validation workflows."""

    @abstractmethod
    def validate_payload(self, payload: Any) -> Any:
        """Validate a payload and return the normalized result."""
