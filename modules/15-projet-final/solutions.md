# Pistes de solution — Module 15

## Jalon 1
- Réduction de taille : `docker image ls`, puis `dive`. Gains typiques : supprimer le cache pip (`PIP_NO_CACHE_DIR`), éviter `COPY . .`, utiliser un venv copié depuis l'étape `deps`. L'image finale tourne autour de 150 Mo (python:3.12-slim ≈ 130 Mo + dépendances).
- Cache : modifier `app/__init__.py` et reconstruire → seules les couches `COPY app` et suivantes sont rejouées.
- Labels : `docker build --build-arg VERSION=1.0.0 --build-arg GIT_SHA=$(git rev-parse --short HEAD) --target runtime ./api`.

## Jalon 2
Backup / restore :
```bash
# backup.sh
docker compose exec -T db pg_dump -U todo todo | gzip > backups/todo-$(date +%F-%H%M).sql.gz
# restore.sh
gunzip -c "$1" | docker compose exec -T db psql -U todo -d todo
```
Isolation : `docker compose exec proxy getent hosts db` ne renvoie rien (le proxy n'est que sur `front`) ; `back` est `internal` donc `db` n'a pas d'accès sortant.

Cache Redis (profil) : service `redis:7-alpine` avec `profiles: [cache]`, variable `REDIS_URL`, dans l'API : `GET` lit la clé `todos`, chaque écriture la supprime (`DEL`). Dégrader en douceur si Redis est absent (try/except).

## Jalon 3
Squelette `ci-todo.yml` :
```yaml
name: ci-todo
on: { push: { branches: [main], tags: ["v*"] }, pull_request: {} }
permissions: { contents: read, packages: write, id-token: write, security-events: write }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hadolint/hadolint-action@v3.1.0
        with: { dockerfile: modules/15-projet-final/projet/api/Dockerfile }
      - uses: docker/setup-buildx-action@v3
      - run: docker buildx build --target test modules/15-projet-final/projet/api
  integration:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - working-directory: modules/15-projet-final/projet
        run: |
          cp .env.example .env
          docker compose up -d --build --wait --wait-timeout 120
          ./scripts/smoke-test.sh
      - if: failure()
        working-directory: modules/15-projet-final/projet
        run: docker compose logs --no-color
  publish:
    needs: integration
    if: github.event_name != 'pull_request'
    uses: ./.github/workflows/build-push-ghcr.yml   # réutiliser le workflow du module 10 (adapter le contexte)
```
Rollback : redéployer `TAG=<version précédente>` avec `compose.prod.yaml`.

## Jalon 4
Secret Postgres :
```yaml
services:
  db:
    environment: { POSTGRES_PASSWORD_FILE: /run/secrets/pg }
    secrets: [pg]
  api:
    secrets: [pg]
    environment: { DB_PASSWORD_FILE: /run/secrets/pg }
secrets:
  pg: { file: ./secrets/pg.txt }
```
Dans `wsgi.py`, construire `DATABASE_URL` à partir du fichier. Aucun secret dans `docker inspect` ni dans les variables d'environnement.

## Jalon 5
```python
from prometheus_client import Counter, Histogram, make_wsgi_app
from werkzeug.middleware.dispatcher import DispatcherMiddleware
app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {"/metrics": make_wsgi_app()})
```
Alerte : `up{job="todo-api"} == 0` ou `probe_success{...} == 0` `for: 2m`.

## Jalon 6
Kubernetes : réutiliser [`13-orchestration/k8s/deployment.yaml`](../13-orchestration/k8s/deployment.yaml) comme base ; probes `httpGet /live` et `/ready`; `RollingUpdate` avec `maxUnavailable: 0`.

## Exercices de panne
1. Sans volume, la base est recréée vide ; l'API recrée la table au démarrage (`CREATE TABLE IF NOT EXISTS`) mais les données sont perdues ⇒ restauration par `restore.sh`.
2. `docker compose logs db` : `password authentication failed`. Le volume garde l'ancien mot de passe (voir module 09).
3. Garde-fou : étape de CI qui lance l'image candidate et exige `/ready` = 200 avant le push.
4. `docker inspect -f '{{.State.OOMKilled}}'` ⇒ augmenter la limite ou réduire le nombre de workers gunicorn.
