# Solutions — Module 05

## Lab 5.1
Voir [`app-python/Dockerfile`](app-python/Dockerfile).

## Lab 5.2 — Défauts
1. `FROM ubuntu` : tag `latest` implicite, image lourde.
2. `apt-get update` isolé dans son propre `RUN` : cache périmé (update/install séparés).
3. Pas de `--no-install-recommends`, pas de nettoyage de `/var/lib/apt/lists`.
4. Paquets inutiles (`vim`, `git`, `curl`) : surface d'attaque, taille.
5. `COPY . /app` avant l'installation des dépendances : cache inefficace ; pas de `.dockerignore`.
6. `RUN cd /app` au lieu de `WORKDIR`.
7. `ENV DB_PASSWORD=…` : secret dans l'image.
8. `EXPOSE 22` : SSH inutile dans un conteneur.
9. `CMD` en forme shell ; processus en root ; pas de `USER`, pas de `HEALTHCHECK`.

Version corrigée :
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --system --uid 10001 app
USER app
EXPOSE 5000
CMD ["python", "app.py"]
```
(`DB_PASSWORD` se passe à l'exécution : `-e` / secret.)

## Lab 5.3
```sh
#!/bin/sh
set -e
case "${APP_ENV:-}" in
  dev|staging|prod) ;;
  *) echo "APP_ENV doit valoir dev, staging ou prod (reçu: '${APP_ENV:-}')" >&2; exit 64 ;;
esac
cat > /app/config.json <<JSON
{"env": "${APP_ENV}", "debug": ${DEBUG:-false}}
JSON
exec "$@"
```
`docker run img` échoue (code 64) ; `docker run -e APP_ENV=prod img` démarre. Pensez à `chown` de `/app` pour que `appuser` puisse écrire `config.json`.

## Lab 5.4
```dockerfile
ARG VERSION=dev
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$GIT_SHA \
      org.opencontainers.image.source="https://github.com/nzembouong18/docker"
```
```bash
docker build --build-arg VERSION=1.0.0 --build-arg GIT_SHA=$(git rev-parse --short HEAD) -t app:1.0.0 .
docker inspect -f '{{json .Config.Labels}}' app:1.0.0
```

## Lab 5.5
Ordres de grandeur : `node:22` ≈ 1,1 Go · `-slim` ≈ 220 Mo · `-alpine` ≈ 160 Mo. Rebuild après modification de `server.js` : quelques secondes (cache sur `npm install`).
