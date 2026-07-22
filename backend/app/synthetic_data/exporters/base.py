from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

T = TypeVar("T")


class BaseExporter(ABC, Generic[T]):
    """Abstract contract for exporting synthetic data records.

    Exporters encapsulate serialization and transport concerns so generators
    remain focused on record creation only.
    """

    @abstractmethod
    async def export(self, records: list[T]) -> Any:
        """Export the provided records to the target representation."""
