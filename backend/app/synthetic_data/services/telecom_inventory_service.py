from __future__ import annotations

from typing import Any

from app.synthetic_data.generators.band_generator import BandGenerator
from app.synthetic_data.generators.carrier_generator import CarrierGenerator
from app.synthetic_data.generators.cell_generator import CellGenerator
from app.synthetic_data.generators.circle_generator import CircleGenerator
from app.synthetic_data.generators.cluster_generator import ClusterGenerator
from app.synthetic_data.generators.market_generator import MarketGenerator
from app.synthetic_data.generators.region_generator import RegionGenerator
from app.synthetic_data.generators.sector_generator import SectorGenerator
from app.synthetic_data.generators.site_generator import SiteGenerator
from app.synthetic_data.models.site import SiteRecord
from app.synthetic_data.models.telecom.band import Band
from app.synthetic_data.models.telecom.carrier import Carrier
from app.synthetic_data.models.telecom.cell import Cell
from app.synthetic_data.models.telecom.circle import Circle
from app.synthetic_data.models.telecom.cluster import Cluster
from app.synthetic_data.models.telecom.market import Market
from app.synthetic_data.models.telecom.region import Region


class TelecomInventoryService:
    """Assemble a realistic telecom inventory hierarchy using injectable generators."""

    def __init__(
        self,
        region_generator: RegionGenerator | None = None,
        circle_generator: CircleGenerator | None = None,
        market_generator: MarketGenerator | None = None,
        cluster_generator: ClusterGenerator | None = None,
        site_generator: SiteGenerator | None = None,
        cell_generator: CellGenerator | None = None,
        sector_generator: SectorGenerator | None = None,
        carrier_generator: CarrierGenerator | None = None,
        band_generator: BandGenerator | None = None,
    ) -> None:
        self._region_generator = region_generator or RegionGenerator(seed=42)
        self._circle_generator = circle_generator or CircleGenerator(seed=42)
        self._market_generator = market_generator or MarketGenerator(seed=42)
        self._cluster_generator = cluster_generator or ClusterGenerator(seed=42)
        self._site_generator = site_generator or SiteGenerator(seed=42)
        self._cell_generator = cell_generator or CellGenerator(seed=42)
        self._sector_generator = sector_generator or SectorGenerator(seed=42)
        self._carrier_generator = carrier_generator or CarrierGenerator(seed=42)
        self._band_generator = band_generator or BandGenerator(seed=42)

    async def generate_inventory(
        self,
        region_count: int = 1,
        circles_per_region: int = 1,
        markets_per_circle: int = 1,
        clusters_per_market: int = 1,
        sites_per_cluster: int = 1,
        cells_per_site: int = 1,
        carriers_count: int = 1,
        bands_per_carrier: int = 1,
    ) -> dict[str, Any]:
        regions: list[Region] = []
        circles: list[Circle] = []
        markets: list[Market] = []
        clusters: list[Cluster] = []
        sites: list[SiteRecord] = []
        cells: list[Cell] = []
        carriers: list[Carrier] = []
        bands: list[Band] = []

        for _ in range(max(int(region_count), 0)):
            region = await self._region_generator.generate_one()
            regions.append(region)

            for _ in range(max(int(circles_per_region), 0)):
                circle = await self._circle_generator.generate_one(region_id=str(region.id))
                circles.append(circle)

                for _ in range(max(int(markets_per_circle), 0)):
                    market = await self._market_generator.generate_one(circle_id=str(circle.id))
                    markets.append(market)

                    for _ in range(max(int(clusters_per_market), 0)):
                        cluster = await self._cluster_generator.generate_one(market_id=str(market.id))
                        clusters.append(cluster)

                        for _ in range(max(int(sites_per_cluster), 0)):
                            site = await self._site_generator.generate_one(
                                region=region.name,
                                market=market.name,
                                cluster=cluster.name,
                            )
                            sites.append(site)

                            for _ in range(max(int(cells_per_site), 0)):
                                cell = await self._cell_generator.generate_one(
                                    site_id=site.site_id,
                                    cell_id=f"{site.site_id}-cell-{len(cells) + 1}",
                                )
                                cells.append(cell)

        for _ in range(max(int(carriers_count), 0)):
            carrier = await self._carrier_generator.generate_one()
            carriers.append(carrier)

            for _ in range(max(int(bands_per_carrier), 0)):
                band = await self._band_generator.generate_one(carrier_id=str(carrier.id))
                bands.append(band)

        return {
            "regions": regions,
            "circles": circles,
            "markets": markets,
            "clusters": clusters,
            "sites": sites,
            "cells": cells,
            "carriers": carriers,
            "bands": bands,
        }
