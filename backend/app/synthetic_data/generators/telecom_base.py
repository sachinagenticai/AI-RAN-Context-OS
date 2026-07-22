from __future__ import annotations

from typing import Any, Generic, TypeVar

from faker import Faker

from app.synthetic_data.generators.base import BaseGenerator
from app.synthetic_data.models.base import BaseScenario

T = TypeVar("T")


class TelecomBaseGenerator(BaseGenerator[T], Generic[T]):
    """Base helper for deterministic telecom generators.

    This class centralizes Faker seeding and provides a small reusable surface
    for concrete generators without coupling them to a specific domain model.
    """

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        self._faker = faker or Faker()
        if seed is not None:
            self._faker.seed_instance(seed)

    async def generate(self, scenario: BaseScenario[T]) -> list[T]:
        count = max(int(getattr(scenario, "count", 1)), 1)
        return [await self.generate_one(scenario) for _ in range(count)]

    async def generate_one(self, scenario: BaseScenario[T]) -> T:
        raise NotImplementedError("Concrete generator must implement generate_one")
