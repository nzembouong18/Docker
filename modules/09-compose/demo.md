# Démos — Module 09

Toutes depuis `modules/09-compose/stack/`.

## Démo 1 — Démarrer la stack complète (10 min)
```bash
cp secrets/db_password.txt.example secrets/db_password.txt
docker compose config | head -60            # config résolue
docker compose up -d --build
docker compose ps
for i in 1 2 3; do curl -s localhost:8080; echo; done
docker compose logs --tail 20 web
```

## Démo 2 — Ordre de démarrage et healthchecks (5 min)
```bash
docker compose down
docker compose up -d && docker compose ps    # observer "starting" → "healthy"
docker compose events --json | head          # ctrl+C
```

## Démo 3 — Persistance (5 min)
```bash
curl -s localhost:8080                        # compteur Postgres N
docker compose down                           # sans -v
docker compose up -d && sleep 15 && curl -s localhost:8080       # visits_postgres continue
docker compose exec redis redis-cli get hits  # Redis non persistant: reparti à 0
```

## Démo 4 — Isolement réseau (5 min)
```bash
docker compose exec proxy sh -c 'getent hosts db || echo "proxy ne voit pas db ✅"'
docker compose exec web python -c "import socket;print(socket.gethostbyname('db'))"
docker compose exec web python -c "import urllib.request;urllib.request.urlopen('https://example.com',timeout=3)" 2>&1 | tail -1
```
`web` est aussi sur `front` (non interne) donc sort sur Internet ; `db` et `redis` (réseau `back` interne uniquement) ne sortent pas.

## Démo 5 — Profil debug (3 min)
```bash
docker compose --profile debug up -d adminer
# http://127.0.0.1:8081 : système PostgreSQL, serveur db, user app, mot de passe = contenu de secrets/db_password.txt
docker compose --profile debug down
```

## Démo 6 — Scale (5 min)
```bash
docker compose -f compose.yaml up -d --scale web=3 --no-recreate
docker compose ps
for i in $(seq 6); do curl -s localhost:8080 | python3 -c "import sys,json;print(json.load(sys.stdin)['host'])"; done
```
(Utiliser `-f compose.yaml` pour ignorer l'override qui publie le port 5000 : plusieurs réplicas ne peuvent pas partager un port hôte.)

## Démo 7 — Override de développement (5 min)
```bash
docker compose down && docker compose up -d       # compose.override.yaml appliqué: --reload
sed -i 's/hits_redis/hits/' web/app.py            # gunicorn recharge
curl -s localhost:5000
git checkout web/app.py 2>/dev/null || sed -i 's/"hits"/"hits_redis"/' web/app.py
```

## Démo 8 — Tâche ponctuelle et nettoyage (3 min)
```bash
docker compose run --rm db psql -h db -U app -d app -c "select count(*) from visits;"   # demandera le mot de passe
docker compose down -v --remove-orphans
```
