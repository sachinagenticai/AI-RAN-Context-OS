from __future__ import annotations

from datetime import datetime
from uuid import UUID

import pytest

from app.synthetic_data.models.telecom.band import Band
from app.synthetic_data.models.telecom.carrier import Carrier
from app.synthetic_data.models.telecom.cell import Cell
from app.synthetic_data.models.telecom.circle import Circle
from app.synthetic_data.models.telecom.cluster import Cluster
from app.synthetic_data.models.telecom.enums import BandType, CarrierName, SectorId, Technology
from app.synthetic_data.models.telecom.market import Market
from app.synthetic_data.models.telecom.region import Region
from app.synthetic_data.models.telecom.sector import Sector
from app.synthetic_data.models.telecom.site import Site


def test_telecom_models_create_uuid_and_timestamps() -> None:
    region = Region(name="North", code="NTH", description="Northern region")

    assert isinstance(region.id, UUID)
    assert isinstance(region.created_at, datetime)
    assert isinstance(region.updated_at, datetime)


def test_cell_requires_exactly_three_sectors() -> None:
    with pytest.raises(ValueError):
        Cell(
            site_id="site-1",
            name="Cell A",
            technology=Technology.LTE,
            sectors=[
                Sector(cell_id="cell-1", sector_id=SectorId.A, azimuth=0, power_dbm=20.0),
                Sector(cell_id="cell-1", sector_id=SectorId.B, azimuth=120, power_dbm=20.0),
            ],
        )


def test_supported_domain_models_construct_cleanly() -> None:
    region = Region(name="West", code="WST")
    circle = Circle(name="Circle-1", code="C1", region_id=str(region.id))
    market = Market(name="Market-1", code="M1", circle_id=str(circle.id))
    cluster = Cluster(name="Cluster-1", code="CL1", market_id=str(market.id))
    site = Site(name="Site-1", code="S1", cluster_id=str(cluster.id))
    carrier = Carrier(name=CarrierName.VERIZON, code="VZN")
    band = Band(name="Band 28", frequency_mhz=700, technology=Technology.LTE, band_type=BandType.LOW)
    sector_a = Sector(cell_id="cell-1", sector_id=SectorId.A, azimuth=0, power_dbm=20.0)
    sector_b = Sector(cell_id="cell-1", sector_id=SectorId.B, azimuth=120, power_dbm=20.0)
    sector_c = Sector(cell_id="cell-1", sector_id=SectorId.C, azimuth=240, power_dbm=20.0)
    cell = Cell(site_id=str(site.id), name="Cell-1", technology=Technology.NR, sectors=[sector_a, sector_b, sector_c])

    assert region.code == "WST"
    assert circle.region_id == str(region.id)
    assert market.circle_id == str(circle.id)
    assert cluster.market_id == str(market.id)
    assert site.cluster_id == str(cluster.id)
    assert carrier.name == CarrierName.VERIZON
    assert band.technology == Technology.LTE
    assert len(cell.sectors) == 3
