import os

from flask import Flask, jsonify, request

from .store import MemoryStore, PostgresStore


def create_app(store=None):
    app = Flask(__name__)
    if store is None:
        dsn = os.getenv("DATABASE_URL")
        store = PostgresStore(dsn) if dsn else MemoryStore()
    app.config["store"] = store

    @app.get("/live")
    def live():
        return jsonify(status="alive")

    @app.get("/ready")
    def ready():
        try:
            app.config["store"].ping()
        except Exception as exc:  # noqa: BLE001
            return jsonify(status="not ready", error=str(exc)), 503
        return jsonify(status="ready")

    @app.get("/api/todos")
    def list_todos():
        return jsonify(app.config["store"].list())

    @app.post("/api/todos")
    def create_todo():
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify(error="title requis"), 400
        return jsonify(app.config["store"].create(title)), 201

    @app.patch("/api/todos/<int:todo_id>")
    def toggle_todo(todo_id):
        todo = app.config["store"].toggle(todo_id)
        if todo is None:
            return jsonify(error="introuvable"), 404
        return jsonify(todo)

    @app.delete("/api/todos/<int:todo_id>")
    def delete_todo(todo_id):
        if not app.config["store"].delete(todo_id):
            return jsonify(error="introuvable"), 404
        return "", 204

    return app
