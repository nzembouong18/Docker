# Labos — Module 09

## Lab 9.1 — Prise en main de la stack (30 min)
1. Lancez [`stack/`](stack/) et vérifiez que tous les services sont `healthy`.
2. Faites 10 requêtes : que représentent `hits_redis` et `visits_postgres` ?
3. Arrêtez Redis (`docker compose stop redis`) : que répond `/` ? `/health` ? Redémarrez-le.
4. Cassez volontairement le mot de passe (modifiez `secrets/db_password.txt` sans supprimer le volume) : que se passe-t-il et pourquoi ? Comment réparer ?

## Lab 9.2 — Conteneuriser votre propre application (60 min)
Choisissez une appli (Node + MongoDB, Python/Django + Postgres, PHP + MySQL, ou WordPress + MariaDB) et écrivez son `compose.yaml` avec :
- 3 services minimum, réseaux séparés, volumes nommés,
- healthchecks et `depends_on` conditionnels,
- secrets ou `.env` (avec `.env.example` commité),
- un `compose.override.yaml` de dev (bind mount, port debug) et un `compose.prod.yaml` (limites, restart, pas de bind mount).

## Lab 9.3 — Migrations et jobs (30 min)
Ajoutez à la stack un service `migrate` (job one-shot) qui crée une table `migrations` au démarrage, et faites dépendre `web` de `service_completed_successfully`. Vérifiez l'ordre via `docker compose events`.

## Lab 9.4 — Profils & outillage (20 min)
Ajoutez des profils : `debug` (adminer), `monitoring` (cAdvisor sur 127.0.0.1:8082), `tools` (un conteneur `netshoot` sur `back`). Démarrez-les à la demande.

## Lab 9.5 — Développement avec `watch` (25 min)
Configurez `develop.watch` pour `web` (sync de `app.py`, rebuild si `requirements.txt` change) et prouvez que les deux actions fonctionnent.

## Lab 9.6 — Validation en CI (15 min)
Écrivez un script `check.sh` : `docker compose config -q`, lint hadolint des Dockerfile, `docker compose up -d --wait`, test `curl` de `/health`, `down -v`. (`--wait` attend les healthchecks.)

> Corrigés : [solutions.md](solutions.md)
