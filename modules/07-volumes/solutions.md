# Solutions — Module 07

## Lab 7.1
```bash
docker run -d --name db -v dbdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=x postgres:16-alpine
sleep 5
docker exec db psql -U postgres -c "create table t(n int); insert into t select generate_series(1,100);"
docker rm -f db
docker run -d --name db -v dbdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=x postgres:16-alpine
sleep 5; docker exec db psql -U postgres -tc "select count(*) from t;"   # 100
sudo ls /var/lib/docker/volumes/dbdata/_data
```

## Lab 7.2
```bash
#!/usr/bin/env bash
set -euo pipefail
vol=$1; mkdir -p backups
file="backups/${vol}-$(date +%F-%H%M).tar.gz"
docker run --rm -v "$vol":/data:ro -v "$PWD/backups":/backup alpine \
  tar czf "/backup/$(basename "$file")" -C /data .
tar tzf "$file" >/dev/null && echo "OK $file"
```
```bash
#!/usr/bin/env bash
set -euo pipefail
archive=$1; newvol=$2
docker volume create "$newvol" >/dev/null
docker run --rm -v "$newvol":/data -v "$PWD/$(dirname "$archive")":/backup alpine \
  tar xzf "/backup/$(basename "$archive")" -C /data
```
Le dump logique est portable entre versions et cohérent ; la copie de fichiers à chaud peut être corrompue.

## Lab 7.3
```bash
docker run --rm -it -p 3000:3000 -v "$PWD/modules/05-dockerfile/app-node":/app -w /app -u node node:22-alpine node --watch server.js
```
Fichiers créés dans le bind mount avec `-u $(id -u):$(id -g)` pour conserver vos droits.

## Lab 7.4
```bash
docker volume create shared
docker run -d --name prod -v shared:/shared alpine sh -c 'while :; do date >> /shared/log.txt; sleep 1; done'
docker run --rm --name cons -v shared:/shared:ro alpine tail -f /shared/log.txt
# variante
docker run --rm --volumes-from prod:ro alpine tail -3 /shared/log.txt
```

## Lab 7.5
```bash
docker run -d --name hard --read-only -p 8080:80 \
  --tmpfs /var/cache/nginx --tmpfs /var/run --tmpfs /tmp \
  -v "$PWD/site":/usr/share/nginx/html:ro nginx:alpine
```
nginx écrit ses caches temporaires, son PID (`/var/run/nginx.pid`) et des fichiers temporaires : d'où les tmpfs.
