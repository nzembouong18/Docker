# Module 09 — Docker Compose

> **Durée** : 4 h · **Niveau** : 🟡 · Exemple complet : [`stack/`](stack/).

## 1. Pourquoi Compose ?

Lancer une application réelle (web + base + cache + proxy) avec des `docker run` interminables est fragile et non reproductible. **Docker Compose** décrit toute l'application dans **un fichier YAML versionné** :

```bash
docker compose up -d      # tout démarrer
docker compose down       # tout arrêter et nettoyer
```

Compose v2 est un plugin de la CLI : `docker compose` (avec un espace). L'ancien binaire `docker-compose` (v1) est obsolète. Le champ `version:` est **obsolète** : ne l'écrivez plus.

Fichier par défaut : `compose.yaml` (ou `docker-compose.yml`).

## 2. Structure d'un fichier

```yaml
name: monprojet            # nom du projet (préfixe des ressources)

services:                  # les conteneurs
  web: { … }
  db:  { … }

networks: { … }            # réseaux nommés
volumes:  { … }            # volumes nommés
secrets:  { … }            # secrets
configs:  { … }            # fichiers de config
```

Compose crée automatiquement un **réseau par projet** : les services se joignent par leur **nom de service**.

## 3. Les clés d'un service

```yaml
services:
  web:
    image: nginx:1.27-alpine          # ou build:
    build:
      context: ./web
      dockerfile: Dockerfile
      target: runtime                 # étape multi-stage
      args: { VERSION: "1.0" }
    container_name: web               # (évitez: empêche le scale)
    command: ["gunicorn", "app:app"]  # remplace CMD
    entrypoint: ["/entrypoint.sh"]
    environment:
      APP_ENV: prod
      DEBUG:                          # transmet la valeur de l'environnement hôte
    env_file: [.env]
    ports: ["8080:80", "127.0.0.1:9000:9000"]
    expose: ["5000"]                  # documentation interne
    volumes:
      - data:/var/lib/data            # volume nommé
      - ./conf:/etc/app:ro            # bind mount
      - type: tmpfs
        target: /tmp
    networks: [front, back]
    depends_on:
      db: { condition: service_healthy }
    restart: unless-stopped
    healthcheck: { test: ["CMD", "curl", "-f", "http://localhost"], interval: 10s, retries: 3 }
    user: "10001:10001"
    working_dir: /app
    read_only: true
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    deploy:
      replicas: 2
      resources:
        limits: { cpus: "0.5", memory: 256M }
    profiles: [debug]
    labels: { com.example.team: "platform" }
    logging:
      driver: local
      options: { max-size: "10m", max-file: "3" }
```

## 4. Dépendances et démarrage ordonné

`depends_on` seul ne garantit que l'ordre de **démarrage**, pas que le service soit **prêt**. Utilisez une `condition` :

| Condition | Attend |
|-----------|--------|
| `service_started` (défaut) | que le conteneur soit lancé |
| `service_healthy` | que le healthcheck soit `healthy` |
| `service_completed_successfully` | qu'un job (ex. migration) ait terminé avec succès |

```yaml
services:
  migrate:
    image: monapp
    command: ["python", "manage.py", "migrate"]
    depends_on: { db: { condition: service_healthy } }
  web:
    image: monapp
    depends_on:
      migrate: { condition: service_completed_successfully }
```

Les applications doivent aussi **retry** leur connexion (le réseau n'est jamais parfait).

## 5. Configuration : variables, `.env`, interpolation

```yaml
services:
  db:
    image: postgres:${PG_VERSION:-16}-alpine       # valeur par défaut
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD obligatoire}   # erreur si absent
```

Compose lit automatiquement un fichier `.env` **à côté du compose.yaml** pour l'**interpolation** (`${VAR}`). Ne confondez pas :
- `.env` → variables pour *remplir le fichier compose*,
- `env_file:` → variables injectées *dans le conteneur*,
- `environment:` → variables du conteneur (priorité haute).

Vérifier le résultat : `docker compose config`.

## 6. Secrets et configs

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt     # monté dans /run/secrets/db_password (tmpfs)
services:
  db:
    secrets: [db_password]
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
```

Beaucoup d'images officielles (postgres, mysql, mariadb…) supportent `*_FILE`. Préférez ce mécanisme aux variables d'environnement, lisibles via `docker inspect`.

`configs:` fonctionne de façon similaire pour des fichiers de configuration non sensibles.

## 7. Plusieurs fichiers : override et profils

- `compose.yaml` + `compose.override.yaml` : fusionnés automatiquement (dev).
- Fichiers explicites : `docker compose -f compose.yaml -f compose.prod.yaml up -d`.
- `include:` pour composer plusieurs projets.
- **Profils** : services optionnels.
  ```bash
  docker compose --profile debug up -d        # démarre aussi adminer
  COMPOSE_PROFILES=debug,monitoring docker compose up
  ```
- **Extension fields & ancres YAML** pour factoriser :
  ```yaml
  x-common: &common
    restart: unless-stopped
    logging: { driver: local }
  services:
    a: { <<: *common, image: a }
    b: { <<: *common, image: b }
  ```

## 8. Commandes essentielles

| Commande | Action |
|----------|--------|
| `docker compose up -d [--build]` | crée/démarre |
| `docker compose down [-v]` | arrête et supprime conteneurs/réseaux (`-v` : volumes) |
| `docker compose ps` / `ls` | état |
| `docker compose logs -f [svc]` | logs |
| `docker compose exec svc sh` | shell |
| `docker compose run --rm svc cmd` | tâche ponctuelle |
| `docker compose build [--no-cache]` | construit les images |
| `docker compose pull` / `push` | images |
| `docker compose restart svc` / `stop` / `start` | cycle de vie |
| `docker compose up -d --scale web=3` | réplicas (sans `container_name` ni port fixe) |
| `docker compose config` | affiche la config finale validée |
| `docker compose top` / `stats`-like: `docker stats` | observation |
| `docker compose watch` | resynchronise/reconstruit à la modification des fichiers |
| `docker compose cp`, `events`, `port`, `images`, `kill`, `rm` | utilitaires |

### `develop.watch` — le hot reload moderne

```yaml
services:
  web:
    build: ./web
    develop:
      watch:
        - action: sync          # copie les fichiers modifiés
          path: ./web/src
          target: /app/src
        - action: rebuild       # reconstruit si changement
          path: ./web/requirements.txt
```
`docker compose watch` (ou `up --watch`).

## 9. Le projet exemple `stack/`

Architecture :

```
Internet ─▶ proxy (nginx) ──front──▶ web (Flask) ──back (internal)──▶ db (Postgres)
                                                          └──────────▶ redis
                                  adminer (profil debug) ─back
```

Lancement :
```bash
cd modules/09-compose/stack
cp secrets/db_password.txt.example secrets/db_password.txt     # secret de dev
docker compose up -d --build
docker compose ps                  # attendre "healthy"
curl localhost:8080                # {"hits_redis":1,"visits_postgres":1,…}
curl localhost:8080                # les compteurs augmentent
docker compose logs -f web
docker compose --profile debug up -d adminer    # http://127.0.0.1:8081 (serveur: db)
docker compose down                # les données restent (volume pgdata)
docker compose down -v             # supprime aussi les données
```

Ce qu'il illustre : réseaux front/back (back `internal`), healthchecks + `depends_on` conditionnels, secrets, profil, limites de ressources, override de dev avec rechargement.

## 10. Bonnes pratiques

1. Un fichier `compose.yaml` **de base** neutre + overrides par environnement.
2. Pinnez les versions d'images.
3. Pas de `container_name` (permet `--scale` et plusieurs projets).
4. Ne publiez que le nécessaire ; liez les ports de debug à `127.0.0.1`.
5. Healthchecks + `service_healthy` + retry applicatif.
6. Secrets via `secrets:`, jamais commités (`.gitignore`).
7. Limites de ressources et `restart`.
8. `docker compose config` en CI pour valider.
9. Compose est excellent pour **dev, tests, petits déploiements mono-hôte** ; pour du multi-hôtes, pensez Swarm/Kubernetes.

## 11. Dépannage

| Problème | Piste |
|----------|-------|
| Service redémarre en boucle | `docker compose logs svc`, `ps -a`, code de sortie |
| `depends_on` n'attend pas | ajouter `healthcheck` + `condition` |
| Variable vide | `docker compose config` ; `.env` mal placé ; guillemets |
| Port déjà pris | autre port hôte ; `docker compose down` d'un autre projet |
| Données perdues | `down -v` supprime les volumes |
| Modif de Dockerfile ignorée | `up --build` ou `build --no-cache` |
| Conflit de noms | `-p autre-nom` ou `name:` |

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 10](../10-ci-cd/)
