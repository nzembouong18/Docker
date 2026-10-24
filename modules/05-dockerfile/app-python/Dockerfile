# ✅ Version propre
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# 1) dépendances d'abord : cette couche est réutilisée tant que requirements.txt ne change pas
COPY requirements.txt .
RUN pip install -r requirements.txt

# 2) code ensuite
COPY app.py .

# 3) utilisateur non-root
RUN useradd --system --uid 10001 appuser
USER appuser

ENV PORT=5000
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request,os;urllib.request.urlopen(f'http://localhost:{os.getenv(\"PORT\",\"5000\")}/health')" || exit 1

# forme exec : gunicorn est PID 1 et reçoit SIGTERM
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]
