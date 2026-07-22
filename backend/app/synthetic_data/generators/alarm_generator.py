from __future__ import annotations

from faker import Faker

from app.synthetic_data.generators.telecom_base import TelecomBaseGenerator
from app.synthetic_data.models.alarm.alarm import Alarm, AlarmSeverity


class AlarmGenerator(TelecomBaseGenerator[Alarm]):
    """Generate realistic telecom alarms with entity references and severity."""

    ALARM_TITLES: tuple[tuple[str, str], ...] = (
        ("Power Failure", "The power supply for the entity has failed."),
        ("Fiber Cut", "The fiber connection for the entity is cut."),
        ("Cell Down", "The cell serving the entity is unavailable."),
        ("Sector Down", "One sector of the cell is unavailable."),
        ("RRU Failure", "The remote radio unit has failed."),
        ("DU Failure", "The distributed unit has failed."),
        ("CU Failure", "The centralized unit has failed."),
        ("Battery Failure", "The backup battery has failed."),
        ("High Temperature", "The equipment is running above safe temperature."),
        ("Backhaul Failure", "The backhaul connection is unavailable."),
    )

    def __init__(self, seed: int | None = None, faker: Faker | None = None) -> None:
        super().__init__(seed=seed, faker=faker)

    async def generate_one(
        self,
        scenario: object | None = None,
        affected_entity_type: str = "site",
        affected_entity_id: str | None = None,
        site_id: str | None = None,
        cell_id: str | None = None,
        sector_id: str | None = None,
    ) -> Alarm:
        title, description = self._faker.random_element(elements=list(self.ALARM_TITLES))
        severity = self._faker.random_element(elements=list(AlarmSeverity))
        entity_id = affected_entity_id or f"{affected_entity_type}-id"
        return Alarm(
            id=self._faker.bothify(text="ALM-####"),
            title=title,
            description=description,
            severity=severity,
            affected_entity_type=affected_entity_type,
            affected_entity_id=entity_id,
            site_id=site_id or "site-id",
            cell_id=cell_id or "cell-id",
            sector_id=sector_id or "sector-id",
        )

    async def generate_many(self, count: int = 1, affected_entity_type: str = "site", affected_entity_id: str | None = None) -> list[Alarm]:
        return [await self.generate_one(affected_entity_type=affected_entity_type, affected_entity_id=affected_entity_id) for _ in range(count)]
