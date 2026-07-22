from __future__ import annotations

from app.schemas.context_search import (
    ContextSearchItem,
    ContextSearchRequest,
    ContextSearchResponse,
    PaginationMeta,
)


class ContextSearchService:
    """Search and paginate context objects using simple in-memory filtering."""

    def __init__(self) -> None:
        self._records = [
            {
                "id": "ctx-001",
                "site": "Site A",
                "cell": "Cell 1",
                "alarm": "Power Alarm",
                "region": "North",
                "market": "Market 1",
                "technology": "5G",
                "severity": "Major",
                "context": {"inventory": {"technology": "5G"}, "insights": ["High-severity alarms require attention"]},
            },
            {
                "id": "ctx-002",
                "site": "Site B",
                "cell": "Cell 2",
                "alarm": "Interference",
                "region": "South",
                "market": "Market 2",
                "technology": "LTE",
                "severity": "Minor",
                "context": {"inventory": {"technology": "LTE"}, "insights": ["Signal quality is below expected threshold"]},
            },
            {
                "id": "ctx-003",
                "site": "Site C",
                "cell": "Cell 3",
                "alarm": "Hardware Failure",
                "region": "North",
                "market": "Market 3",
                "technology": "5G",
                "severity": "Critical",
                "context": {"inventory": {"technology": "5G"}, "insights": ["High-severity alarms require attention"]},
            },
        ]

    def search(self, request: ContextSearchRequest) -> ContextSearchResponse:
        filtered = [record for record in self._records if self._matches(record, request)]
        total_items = len(filtered)
        total_pages = max(1, (total_items + request.page_size - 1) // request.page_size)
        start = (request.page - 1) * request.page_size
        end = start + request.page_size
        paged = filtered[start:end]

        return ContextSearchResponse(
            items=[ContextSearchItem(**record) for record in paged],
            pagination=PaginationMeta(
                page=request.page,
                page_size=request.page_size,
                total_items=total_items,
                total_pages=total_pages,
            ),
        )

    def _matches(self, record: dict[str, object], request: ContextSearchRequest) -> bool:
        return all(
            self._matches_field(record, field_name, value)
            for field_name, value in {
                "site": request.site,
                "cell": request.cell,
                "alarm": request.alarm,
                "region": request.region,
                "market": request.market,
                "technology": request.technology,
                "severity": request.severity,
            }.items()
            if value is not None
        )

    def _matches_field(self, record: dict[str, object], field_name: str, value: str | None) -> bool:
        if value is None:
            return True
        record_value = record.get(field_name)
        return isinstance(record_value, str) and record_value.lower() == value.lower()
