import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.main import app

client = TestClient(app)


def test_context_search_endpoint_filters_and_paginates() -> None:
    response = client.get(
        "/api/v1/context/search",
        params={"technology": "5G", "severity": "Major", "page": 1, "page_size": 2},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["pagination"]["page"] == 1
    assert payload["pagination"]["page_size"] == 2
    assert payload["items"]
    assert all(item["technology"] == "5G" for item in payload["items"])
    assert all(item["severity"] == "Major" for item in payload["items"])
