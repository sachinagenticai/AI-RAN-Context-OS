import asyncio
from uuid import UUID

from app.synthetic_data.exporters.site_exporter import CsvExporter, JsonExporter
from app.synthetic_data.generators.band_generator import BandGenerator
from app.synthetic_data.generators.carrier_generator import CarrierGenerator
from app.synthetic_data.generators.cell_generator import CellGenerator
from app.synthetic_data.generators.circle_generator import CircleGenerator
from app.synthetic_data.generators.cluster_generator import ClusterGenerator
from app.synthetic_data.generators.market_generator import MarketGenerator
from app.synthetic_data.generators.region_generator import RegionGenerator
from app.synthetic_data.generators.sector_generator import SectorGenerator
from app.synthetic_data.models.telecom.band import Band
from app.synthetic_data.models.telecom.carrier import Carrier
from app.synthetic_data.models.telecom.cell import Cell
from app.synthetic_data.models.telecom.circle import Circle
from app.synthetic_data.models.telecom.cluster import Cluster
from app.synthetic_data.models.telecom.enums import CarrierName, SectorId, Technology
from app.synthetic_data.models.telecom.market import Market
from app.synthetic_data.models.telecom.region import Region
from app.synthetic_data.models.telecom.sector import Sector


def test_generators_create_related_inventory_models() -> None:
    region_generator = RegionGenerator(seed=42)
    circle_generator = CircleGenerator(seed=42)
    market_generator = MarketGenerator(seed=42)
    cluster_generator = ClusterGenerator(seed=42)
    carrier_generator = CarrierGenerator(seed=42)
    band_generator = BandGenerator(seed=42)

    region = asyncio.run(region_generator.generate_one())
    circle = asyncio.run(circle_generator.generate_one(region_id=str(region.id)))
    market = asyncio.run(market_generator.generate_one(circle_id=str(circle.id)))
    cluster = asyncio.run(cluster_generator.generate_one(market_id=str(market.id)))
    carrier = asyncio.run(carrier_generator.generate_one())
    band = asyncio.run(band_generator.generate_one(carrier_id=str(carrier.id)))

    assert isinstance(region, Region)
    assert isinstance(circle, Circle)
    assert isinstance(market, Market)
    assert isinstance(cluster, Cluster)
    assert isinstance(carrier, Carrier)
    assert isinstance(band, Band)
    assert circle.region_id == str(region.id)
    assert market.circle_id == str(circle.id)
    assert cluster.market_id == str(market.id)
    assert band.carrier_id == str(carrier.id)


def test_cell_and_sector_generators_create_three_sectors() -> None:
    cell_generator = CellGenerator(seed=7)
    sector_generator = SectorGenerator(seed=7)

    site_id = "site-123"
    cell = asyncio.run(cell_generator.generate_one(site_id=site_id))
    sectors = asyncio.run(sector_generator.generate_many(cell_id=str(cell.id), count=3))

    assert isinstance(cell, Cell)
    assert len(cell.sectors) == 3
    assert cell.site_id == site_id
    assert len(sectors) == 3
    assert {sector.sector_id for sector in sectors} == {SectorId.A, SectorId.B, SectorId.C}


def test_generators_support_json_and_csv_export() -> None:
    region_generator = RegionGenerator(seed=9)
    region = asyncio.run(region_generator.generate_one())

    json_payload = asyncio.run(JsonExporter().export([region]))
    csv_payload = asyncio.run(CsvExporter().export([region]))

    assert '"name"' in json_payload
    assert 'region_id' not in csv_payload
    assert 'name' in csv_payload
