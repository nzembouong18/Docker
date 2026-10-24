# Labos — Module 05

## Lab 5.1 — Conteneuriser une application Python (30 min)
Dans un nouveau dossier, créez une API Flask (ou reprenez [`app-python`](app-python/app.py)) qui expose `/` et `/health`.
Exigences :
- image de base `python:3.12-slim`,
- dépendances installées **avant** la copie du code,
- utilisateur non-root,
- `HEALTHCHECK`,
- `CMD` en forme exec avec gunicorn,
- `.dockerignore`.

**Critères de réussite** : `docker run -p 5000:5000` répond ; `docker stop` < 2 s ; `docker exec <c> id` ≠ root ; un changement dans `app.py` ne relance pas `pip install`.

## Lab 5.2 — Corriger un mauvais Dockerfile (25 min)
Listez au moins **8 défauts** dans ce Dockerfile et proposez une version corrigée :
```dockerfile
FROM ubuntu
RUN apt-get update
RUN apt-get install -y python3 python3-pip curl vim git
COPY . /app
RUN cd /app && pip3 install -r requirements.txt
ENV DB_PASSWORD=SuperSecret123
EXPOSE 22 5000
CMD python3 /app/app.py
```
Utilisez ensuite `hadolint` pour vérifier votre version.

## Lab 5.3 — Un entrypoint configurable (25 min)
Écrivez un `entrypoint.sh` qui :
1. refuse de démarrer si la variable `APP_ENV` n'est pas dans `dev|staging|prod`,
2. génère `/app/config.json` à partir de variables d'environnement,
3. termine par `exec "$@"`.
Intégrez-le à l'image Flask et vérifiez que `docker run img` et `docker run -e APP_ENV=prod img` se comportent différemment.

## Lab 5.4 — ARG et métadonnées (15 min)
Ajoutez des `ARG VERSION` et `ARG GIT_SHA`, les labels OCI correspondants (`org.opencontainers.image.version`, `.revision`, `.source`) et affichez-les avec `docker inspect`.

## Lab 5.5 — Application Node.js (20 min)
Conteneurisez [`app-node`](app-node/) en comparant `node:22`, `node:22-slim` et `node:22-alpine`. Remplissez un tableau taille / temps de build (premier build puis rebuild après modification de `server.js`).

> Corrigés : [solutions.md](solutions.md)
