import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.main import app

client = TestClient(app)


def test_context_intelligence_endpoint_returns_structure() -> None:
    response = client.get("/api/v1/context/intelligence", params={"entity_id": "site-1", "entity_type": "site"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["context"]["entity_id"] == "site-1"
    assert "correlation" in payload
    assert "evidence" in payload
    assert "business_impact" in payload
    assert "timeline" in payload
    assert "quality" in payload
