from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_docs_available():
    # TestClient follows redirects by default; /docs should land on 200
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_schema_available():
    response = client.get("/openapi.json")
    assert response.status_code == 200


def test_openapi_schema_has_openapi_field():
    response = client.get("/openapi.json")
    body = response.json()
    assert "openapi" in body
