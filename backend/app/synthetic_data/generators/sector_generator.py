from __future__ import annotations

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.telecom.enums import SectorId
from app.synthetic_data.models.telecom.sector import Sector


class SectorGenerator(TelecomBaseGenerator[Sector]):
    """Generate Sector domain objects."""

    async def generate_one(self, scenario: object | None = None, cell_id: str | None = None) -> Sector:
        sector_id = self._faker.random_element(elements=list(SectorId))
        return Sector(
            cell_id=cell_id or "cell-id",
            sector_id=sector_id,
            azimuth=self._faker.random_int(min=0, max=360),
            power_dbm=float(self._faker.random_int(min=10, max=40)),
        )

    async def generate_many(self, cell_id: str, count: int = 3) -> list[Sector]:
        sector_ids = [SectorId.A, SectorId.B, SectorId.C]
        return [
            Sector(
                cell_id=cell_id,
                sector_id=sector_ids[index],
                azimuth=self._faker.random_int(min=0, max=360),
                power_dbm=float(self._faker.random_int(min=10, max=40)),
            )
            for index in range(min(count, len(sector_ids)))
        ]
