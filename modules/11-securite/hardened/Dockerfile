# syntax=docker/dockerfile:1
FROM python:3.12-slim AS base
# En production: épinglez le digest -> FROM python:3.12-slim@sha256:<digest>
# (obtenu avec: docker buildx imagetools inspect python:3.12-slim)

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app
WORKDIR /app
COPY --chown=app:app requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=app:app . .
USER 10001:10001
HEALTHCHECK --interval=30s CMD ["python", "-c", "print('ok')"]
CMD ["python", "main.py"]
