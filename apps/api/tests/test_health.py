from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_fields():
    response = client.get("/health")
    body = response.json()
    assert body["status"] == "ok"
    assert body["app_name"] == "Falsify API"
    assert "version" in body
    assert "environment" in body
