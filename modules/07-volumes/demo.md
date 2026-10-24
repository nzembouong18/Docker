# Démos — Module 07

## Démo 1 — Éphémère vs persistant (5 min)
```bash
docker run --rm alpine sh -c 'echo données > /tmp/f; cat /tmp/f'
docker run --rm alpine cat /tmp/f                     # introuvable

docker run --rm -v demo:/data alpine sh -c 'echo persistant > /data/f'
docker run --rm -v demo:/data alpine cat /data/f      # persistant
docker volume inspect demo
```

## Démo 2 — PostgreSQL qui survit (5 min)
```bash
docker run -d --name pg -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=x postgres:16-alpine
sleep 5
docker exec pg psql -U postgres -c "create table t(n int); insert into t values (1),(2);"
docker rm -f pg
docker run -d --name pg -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=x postgres:16-alpine
sleep 5; docker exec pg psql -U postgres -c "select * from t;"
docker rm -f pg
```

## Démo 3 — Bind mount et développement à chaud (5 min)
```bash
mkdir -p /tmp/site && echo "<h1>v1</h1>" > /tmp/site/index.html
docker run -d --name w -p 8088:80 -v /tmp/site:/usr/share/nginx/html:ro nginx:alpine
curl localhost:8088
echo "<h1>v2</h1>" > /tmp/site/index.html && curl localhost:8088
docker exec w sh -c 'echo x > /usr/share/nginx/html/x'      # erreur: lecture seule
docker rm -f w
```

## Démo 4 — Volume vide vs bind mount (masquage) (5 min)
```bash
docker run --rm -v vide:/etc/nginx nginx:alpine ls /etc/nginx          # copié depuis l'image
mkdir -p /tmp/vide
docker run --rm -v /tmp/vide:/etc/nginx nginx:alpine ls /etc/nginx     # vide : le contenu est masqué
```

## Démo 5 — Sauvegarde / restauration (10 min)
```bash
docker run --rm -v demo:/data alpine sh -c 'seq 1 5 > /data/nombres'
docker run --rm -v demo:/data:ro -v "$PWD":/backup alpine tar czf /backup/demo.tgz -C /data .
docker volume rm demo
docker volume create demo
docker run --rm -v demo:/data -v "$PWD":/backup alpine tar xzf /backup/demo.tgz -C /data
docker run --rm -v demo:/data alpine cat /data/nombres
```

## Démo 6 — tmpfs (3 min)
```bash
docker run --rm --tmpfs /secret:size=1m alpine sh -c 'echo clé > /secret/k; df -h /secret; mount | grep secret'
```

## Démo 7 — Pièges des permissions (5 min)
```bash
mkdir -p /tmp/perm && docker run --rm -v /tmp/perm:/d alpine touch /d/fichier-root
ls -l /tmp/perm                           # propriétaire root
docker run --rm -u $(id -u):$(id -g) -v /tmp/perm:/d alpine touch /d/fichier-moi
ls -l /tmp/perm
```
