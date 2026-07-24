from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_models_api_lists_types_and_returns_schema_metadata() -> None:
    types_response = client.get("/api/v1/models/types")
    schema_response = client.get("/api/v1/models/schema", params={"model_type": "CanonicalTelemetry"})
    metadata_response = client.get("/api/v1/models/metadata", params={"model_type": "CanonicalTelemetry"})

    assert types_response.status_code == 200
    assert "CanonicalTelemetry" in types_response.json()
    assert schema_response.status_code == 200
    assert "properties" in schema_response.json()
    assert metadata_response.status_code == 200
    assert metadata_response.json()["model_type"] == "CanonicalTelemetry"


def test_models_api_validates_payloads() -> None:
    response = client.post(
        "/api/v1/models/validate",
        json={
            "model_type": "CanonicalTelemetry",
            "payload": {"source_system": "synthetic", "vendor": "Synthetic", "metric_name": "availability", "value": 99.9},
        },
    )

    assert response.status_code == 200
    assert response.json()["valid"] is True
    assert response.json()["normalized"]["entity_type"] == "canonical_telemetry"