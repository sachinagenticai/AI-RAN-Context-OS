from __future__ import annotations

import csv
import io
import json
from typing import Any

from app.synthetic_data.exporters.base import BaseExporter
from app.synthetic_data.models.site import SiteRecord


class JsonExporter(BaseExporter[SiteRecord]):
    """Export site records as JSON payloads."""

    async def export(self, records: list[SiteRecord]) -> str:
        payload = [record.to_dict() for record in records]
        return json.dumps(payload, indent=2)


class CsvExporter(BaseExporter[SiteRecord]):
    """Export site records as CSV payloads."""

    async def export(self, records: list[SiteRecord]) -> str:
        buffer = io.StringIO()
        if not records:
            return buffer.getvalue()

        payloads = [record.to_dict() for record in records]
        fieldnames = list(payloads[0].keys())
        writer = csv.DictWriter(buffer, fieldnames=fieldnames)
        writer.writeheader()
        for payload in payloads:
            writer.writerow(payload)
        return buffer.getvalue()
