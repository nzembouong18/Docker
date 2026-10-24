import os
import time

import psycopg
import redis
from flask import Flask, jsonify

app = Flask(__name__)

cache = redis.Redis(host=os.getenv("REDIS_HOST", "redis"), port=6379, decode_responses=True)


def db():
    return psycopg.connect(
        host=os.getenv("DB_HOST", "db"),
        dbname=os.getenv("DB_NAME", "app"),
        user=os.getenv("DB_USER", "app"),
        password=open(os.environ["DB_PASSWORD_FILE"]).read().strip()
        if "DB_PASSWORD_FILE" in os.environ
        else os.getenv("DB_PASSWORD", "app"),
        autocommit=True,
    )


def init_db():
    for _ in range(30):  # filet de sécurité en plus du healthcheck
        try:
            with db() as conn:
                conn.execute("CREATE TABLE IF NOT EXISTS visits (id serial PRIMARY KEY, at timestamptz DEFAULT now())")
            return
        except psycopg.OperationalError:
            time.sleep(1)
    raise SystemExit("base de données injoignable")


@app.get("/")
def index():
    hits = cache.incr("hits")
    with db() as conn:
        conn.execute("INSERT INTO visits DEFAULT VALUES")
        total = conn.execute("SELECT count(*) FROM visits").fetchone()[0]
    return jsonify(hits_redis=hits, visits_postgres=total, host=os.uname().nodename)


@app.get("/health")
def health():
    cache.ping()
    with db() as conn:
        conn.execute("SELECT 1")
    return jsonify(status="ok")


init_db()
