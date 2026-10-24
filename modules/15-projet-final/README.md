# Module 15 — Projet final : « Todo » de la machine du développeur à la production

> **Durée** : 6 h · **Niveau** : 🔴 · Code : [`projet/`](projet/).

Ce projet fédère tout le parcours. Vous partez d'une application fonctionnelle (API Flask + PostgreSQL + page web) et devez la **conteneuriser proprement, l'orchestrer, la sécuriser, l'automatiser et l'observer**.

## 1. Architecture cible

```
                       ┌──────────────────────── réseau "front" ────────────────────────┐
 Navigateur ──:8080──▶ │  proxy (nginx)  ──────────▶  api (gunicorn/Flask)              │
                       └─────────────────────────────────┬──────────────────────────────┘
                                                         │ réseau "back" (internal)
                                                    ┌────▼────┐   volume pgdata
                                                    │   db    │ ──────────────▶ (persistant)
                                                    │Postgres │
                                                    └─────────┘
```

| Composant | Rôle | Points d'attention |
|-----------|------|--------------------|
| `proxy` | Sert la page statique et route `/api/` vers `api` | seul point publié, FS en lecture seule |
| `api` | API REST `/api/todos` + `/live`, `/ready` | image multi-stage, non-root, tests intégrés |
| `db` | PostgreSQL 16 | volume nommé, réseau `internal`, healthcheck |

API :

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/todos` | liste |
| POST | `/api/todos` `{"title": "…"}` | crée (400 si vide) |
| PATCH | `/api/todos/<id>` | bascule `done` |
| DELETE | `/api/todos/<id>` | supprime |
| GET | `/live`, `/ready` | liveness / readiness (DB) |

> Prérequis : Docker Compose ≥ 2.24 (le fichier `compose.prod.yaml` utilise `!reset`).

## 2. Prise en main (le point de départ fourni)

```bash
cd modules/15-projet-final/projet
cp .env.example .env                       # POSTGRES_PASSWORD, HTTP_PORT
make test                                  # docker build --target test ./api  (pytest dans le build)
make up                                    # build + compose up --wait
make smoke                                 # test de fumée de bout en bout
open http://localhost:8080
make clean
```

Le dossier fourni contient déjà une base saine. **Votre mission** est de l'améliorer et de la livrer, en suivant les jalons ci-dessous.

## 3. Jalons

### Jalon 1 — Image (modules 05-06) · 1 h
- [ ] Lire et expliquer chaque ligne de [`api/Dockerfile`](projet/api/Dockerfile).
- [ ] Mesurer la taille de l'image ; la réduire (par ex. variante `-slim` figée par digest, suppression de fichiers inutiles) et prouver le gain.
- [ ] Vérifier que les tests s'exécutent dans l'étape `test` et que le rebuild après une modification de `app/` ne réinstalle pas les dépendances.
- [ ] Ajouter `--build-arg VERSION/GIT_SHA` et vérifier les labels OCI.

### Jalon 2 — Compose & données (modules 07-09) · 1 h 30
- [ ] Démarrer la stack ; prouver que `db` n'est pas joignable depuis `proxy` ni depuis Internet.
- [ ] Prouver la persistance (`down` puis `up`), puis écrire `scripts/backup.sh` et `scripts/restore.sh` (`pg_dump`/`psql` via `docker compose exec`).
- [ ] Ajouter un service `migrate` (job) ou un `init` SQL monté dans `/docker-entrypoint-initdb.d`.
- [ ] Ajouter un cache Redis optionnel (profil `cache`) pour `GET /api/todos` (invalidation à chaque écriture).

### Jalon 3 — CI/CD (module 10) · 1 h 30
- [ ] Créer `.github/workflows/ci-todo.yml` : lint hadolint → `docker build --target test` → build multi-arch avec cache GHA → scan Trivy (échec sur CRITICAL) → push GHCR (`sha-*` + semver) → SBOM + provenance + signature cosign.
- [ ] Ajouter un job d'intégration (`compose up --wait` + `scripts/smoke-test.sh`).
- [ ] Déployer en SSH sur une VM avec `compose.prod.yaml` (variables `REGISTRY` et `TAG`) et documenter le rollback.

### Jalon 4 — Sécurité (module 11) · 1 h
- [ ] Vérifier : non-root, `cap_drop: ALL`, `no-new-privileges`, FS RO, limites, aucun secret dans l'image (`trivy image --scanners secret`).
- [ ] Passer le mot de passe Postgres en **secret** (`secrets:` + `POSTGRES_PASSWORD_FILE`) et adapter l'API (`DATABASE_URL` construit depuis un fichier).
- [ ] Ajouter des en-têtes de sécurité nginx (CSP, HSTS en prod) et le TLS avec Caddy ou Traefik + Let's Encrypt (ou certificat auto-signé en local).

### Jalon 5 — Observabilité (module 12) · 1 h
- [ ] Logs de l'API en JSON structuré ; centralisation avec la stack [`12-observabilite/monitoring`](../12-observabilite/monitoring/).
- [ ] Endpoint `/metrics` (prometheus_client) + dashboard Grafana (taux d'erreurs, latence p95).
- [ ] Une alerte « API non prête > 2 min ».

### Jalon 6 — Passage à l'échelle (module 13) · bonus
- [ ] Déployer sur Swarm **ou** Kubernetes (kind) : 3 réplicas d'`api`, mise à jour sans interruption, probes `/live` `/ready`.
- [ ] HPA ou `docker service scale` sous charge (`hey`, `wrk`).

## 4. Livrables

1. Dépôt GitHub avec le code, le `README` du projet (démarrage, architecture, décisions).
2. Pipeline CI/CD vert et image publiée sur GHCR.
3. Rapport d'une page : choix techniques, tailles avant/après, résultats de scan avant/après, procédure de rollback.
4. Démo de 10 minutes : build, déploiement, panne volontaire (kill de `db`, `api` unhealthy), rollback.

## 5. Grille d'évaluation (100 pts)

| Critère | Pts |
|---------|-----|
| Dockerfile : multi-stage, cache, non-root, taille, labels | 15 |
| Compose : réseaux, volumes, healthchecks, dépendances, profils | 15 |
| Persistance, sauvegarde/restauration testées | 10 |
| CI/CD : lint, tests, scan, push, déploiement, rollback | 20 |
| Sécurité : durcissement, secrets, scan propre | 15 |
| Observabilité : logs, métriques, alertes | 10 |
| Documentation et démo | 10 |
| Bonus (orchestration, TLS, autoscaling) | 5 |

Seuil de validation : **70/100**. Niveaux : 70-84 *Praticien*, 85+ *Expert*.

## 6. Pour aller plus loin

- Remplacer Flask par votre langage préféré en gardant les mêmes contrats d'API.
- Ajouter un worker asynchrone (file Redis, Celery/RQ) et un conteneur de tâches planifiées.
- Mettre en place un registre privé + cache pull-through et du GitOps (Argo CD / Flux).
- Passer la certification **DCA** : voir [annexes/preparation-dca.md](../../annexes/preparation-dca.md).

➡️ [Démo](demo.md) · [Labo](lab.md) · [Solutions](solutions.md) · [Quiz](quiz.md)
