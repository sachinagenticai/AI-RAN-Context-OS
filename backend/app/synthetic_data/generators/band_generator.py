from __future__ import annotations

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.telecom.band import Band
from app.synthetic_data.models.telecom.enums import BandType, Technology


class BandGenerator(TelecomBaseGenerator[Band]):
    """Generate Band domain objects."""

    async def generate_one(self, scenario: object | None = None, carrier_id: str | None = None) -> Band:
        return Band(
            name=self._faker.bothify(text="BAND-####"),
            frequency_mhz=self._faker.random_int(min=700, max=3600),
            technology=self._faker.random_element(elements=list(Technology)),
            band_type=self._faker.random_element(elements=list(BandType)),
            carrier_id=carrier_id,
        )
