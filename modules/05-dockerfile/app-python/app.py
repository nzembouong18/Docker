import os
import signal
import sys
from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/")
def index():
    return jsonify(message="Bonjour depuis Docker !", env=os.getenv("APP_ENV", "dev"))


@app.get("/health")
def health():
    return jsonify(status="ok")


def _stop(*_):
    print("SIGTERM reçu, arrêt", flush=True)
    sys.exit(0)


signal.signal(signal.SIGTERM, _stop)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
