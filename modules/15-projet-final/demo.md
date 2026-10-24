# Démo de référence — Module 15 (10 minutes)

Scénario à rejouer devant un public, depuis `modules/15-projet-final/projet/`.

## 1. Tests dans le build (1 min)
```bash
docker build --target test ./api         # échec ⇒ pas d'image : pytest fait partie du build
```

## 2. Démarrage et vérification (2 min)
```bash
cp -n .env.example .env
docker compose up -d --build --wait
docker compose ps
./scripts/smoke-test.sh
```

## 3. Isolation (1 min)
```bash
docker compose exec proxy sh -c 'getent hosts db || echo "proxy ne voit pas db ✅"'
docker compose port db 5432 || echo "db non publié ✅"
docker compose exec api id
docker compose exec api touch /x || echo "FS RO ✅"
```

## 4. Persistance (1 min)
```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"title":"survivre au redémarrage"}' localhost:8080/api/todos
docker compose down && docker compose up -d --wait
curl -s localhost:8080/api/todos
```

## 5. Panne volontaire et auto-diagnostic (3 min)
```bash
docker compose stop db
curl -si localhost:8080/health | head -1          # 503
docker compose ps api                              # unhealthy après ~30 s
docker compose logs --tail 5 api
docker compose start db && docker compose ps       # retour à healthy
```

## 6. Mise à jour sans perte de données (2 min)
```bash
sed -i 's/Nouvelle tâche/Ajouter une tâche/' nginx/html/index.html    # bind mount : immédiat
docker compose up -d --build api                                       # seule api est recréée
docker compose ps
```

## Nettoyage
```bash
docker compose down -v
```
