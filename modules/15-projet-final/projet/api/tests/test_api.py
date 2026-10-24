import pytest

from app import create_app
from app.store import MemoryStore


@pytest.fixture()
def client():
    return create_app(MemoryStore()).test_client()


def test_health(client):
    assert client.get("/live").status_code == 200
    assert client.get("/ready").json["status"] == "ready"


def test_crud(client):
    r = client.post("/api/todos", json={"title": "apprendre Docker"})
    assert r.status_code == 201
    todo_id = r.json["id"]

    assert client.get("/api/todos").json == [{"id": todo_id, "title": "apprendre Docker", "done": False}]
    assert client.patch(f"/api/todos/{todo_id}").json["done"] is True
    assert client.delete(f"/api/todos/{todo_id}").status_code == 204
    assert client.get("/api/todos").json == []


def test_validation_et_404(client):
    assert client.post("/api/todos", json={"title": "  "}).status_code == 400
    assert client.patch("/api/todos/999").status_code == 404
    assert client.delete("/api/todos/999").status_code == 404
