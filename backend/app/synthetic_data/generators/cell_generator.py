from __future__ import annotations

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.telecom.cell import Cell
from app.synthetic_data.models.telecom.enums import Technology
from app.synthetic_data.generators.sector_generator import SectorGenerator


class CellGenerator(TelecomBaseGenerator[Cell]):
    """Generate Cell domain objects with exactly three sectors."""

    async def generate_one(self, scenario: object | None = None, site_id: str | None = None) -> Cell:
        sector_generator = SectorGenerator(seed=self._faker.random_int(min=1, max=1000))
        sectors = await sector_generator.generate_many(cell_id="cell-id", count=3)
        return Cell(
            site_id=site_id or "site-id",
            name=self._faker.bothify(text="CELL-####"),
            technology=self._faker.random_element(elements=list(Technology)),
            sectors=sectors,
        )
