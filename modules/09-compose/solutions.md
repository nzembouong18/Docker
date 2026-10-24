# Solutions — Module 09

## Lab 9.1
2. `hits_redis` : compteur en mémoire Redis (repart à 0 si Redis perd ses données) ; `visits_postgres` : lignes persistées dans le volume `pgdata`.
3. Sans Redis : `/` renvoie une erreur 500 (exception de connexion) et `/health` échoue ; le healthcheck de `web` passe `unhealthy`. Après `start redis`, retour à la normale. Amélioration : traiter le cache comme optionnel (try/except).
4. Postgres ne relit `POSTGRES_PASSWORD_FILE` **qu'à l'initialisation** du volume. Changer le fichier ensuite désynchronise l'appli (échecs d'authentification). Réparation : remettre l'ancien mot de passe, ou `ALTER USER`, ou `down -v` (perte de données).

## Lab 9.3
```yaml
  migrate:
    build: ./web
    command: ["python", "-c", "import app; app.db().execute('CREATE TABLE IF NOT EXISTS migrations(id int)')"]
    secrets: [db_password]
    environment: { DB_HOST: db, DB_PASSWORD_FILE: /run/secrets/db_password }
    depends_on: { db: { condition: service_healthy } }
    networks: [back]
    restart: "no"
  web:
    depends_on:
      migrate: { condition: service_completed_successfully }
```

## Lab 9.4
```yaml
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    profiles: [monitoring]
    ports: ["127.0.0.1:8082:8080"]
    volumes: ["/:/rootfs:ro", "/var/run:/var/run:ro", "/sys:/sys:ro", "/var/lib/docker/:/var/lib/docker:ro"]
  netshoot:
    image: nicolaka/netshoot
    profiles: [tools]
    command: ["sleep", "infinity"]
    networks: [back]
```

## Lab 9.5
```yaml
  web:
    develop:
      watch:
        - { action: sync,    path: ./web/app.py,           target: /app/app.py }
        - { action: rebuild, path: ./web/requirements.txt }
```
`docker compose watch`

## Lab 9.6
```bash
#!/usr/bin/env bash
set -euo pipefail
docker compose config -q
for f in $(git ls-files '*Dockerfile*'); do docker run --rm -i hadolint/hadolint < "$f"; done
docker compose up -d --build --wait
curl -fsS localhost:8080/health
docker compose down -v
```
