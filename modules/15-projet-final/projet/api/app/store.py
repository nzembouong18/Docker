"""Deux implémentations du stockage : mémoire (tests) et PostgreSQL (prod)."""


class MemoryStore:
    def __init__(self):
        self._items = {}
        self._next = 1

    def ping(self):
        return True

    def list(self):
        return sorted(self._items.values(), key=lambda t: t["id"])

    def create(self, title):
        todo = {"id": self._next, "title": title, "done": False}
        self._items[self._next] = todo
        self._next += 1
        return todo

    def toggle(self, todo_id):
        todo = self._items.get(todo_id)
        if todo:
            todo["done"] = not todo["done"]
        return todo

    def delete(self, todo_id):
        return self._items.pop(todo_id, None) is not None


class PostgresStore:
    def __init__(self, dsn):
        import psycopg
        from psycopg.rows import dict_row

        self._psycopg = psycopg
        self._dict_row = dict_row
        self._dsn = dsn
        with self._conn() as c:
            c.execute(
                "CREATE TABLE IF NOT EXISTS todos ("
                "id serial PRIMARY KEY, title text NOT NULL, done boolean NOT NULL DEFAULT false)"
            )

    def _conn(self):
        return self._psycopg.connect(self._dsn, autocommit=True, row_factory=self._dict_row)

    def ping(self):
        with self._conn() as c:
            c.execute("SELECT 1")

    def list(self):
        with self._conn() as c:
            return c.execute("SELECT id, title, done FROM todos ORDER BY id").fetchall()

    def create(self, title):
        with self._conn() as c:
            return c.execute(
                "INSERT INTO todos(title) VALUES (%s) RETURNING id, title, done", (title,)
            ).fetchone()

    def toggle(self, todo_id):
        with self._conn() as c:
            return c.execute(
                "UPDATE todos SET done = NOT done WHERE id = %s RETURNING id, title, done", (todo_id,)
            ).fetchone()

    def delete(self, todo_id):
        with self._conn() as c:
            return c.execute("DELETE FROM todos WHERE id = %s", (todo_id,)).rowcount > 0
