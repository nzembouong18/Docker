# Solutions — Module 08

## Lab 8.1
```bash
docker network create frontend
docker network create --internal backend
docker run -d --name db  --network backend -e POSTGRES_PASSWORD=x postgres:16-alpine
docker run -d --name api --network backend hashicorp/http-echo:1.0 -text=api -listen=:5678
docker network connect frontend api
docker run -d --name proxy --network frontend -p 8080:80 nginx:alpine
# Preuves
docker exec proxy getent hosts db || echo "proxy ne voit pas db ✅"
docker exec db sh -c 'wget -T2 -qO- http://1.1.1.1 || echo "db sans Internet ✅"'
docker run --rm --network backend alpine nc -zv db 5432   # api/backend joint db ✅
curl localhost:8080
```
Note : `api` étant sur un réseau `frontend` non interne, il garde l'accès Internet ; l'isolation sortante de `db` vient de `backend --internal`.

## Lab 8.2
```bash
docker network create n
for i in 1 2 3; do docker run -d --name s$i --network n --network-alias search alpine sleep 300; done
docker run --rm --network n alpine nslookup search     # 3 adresses
```
Le DNS retourne les 3 IP (ordre tournant) : load-balancing DNS rudimentaire (sans santé ni pondération).

## Lab 8.3
`nginx.conf` :
```nginx
resolver 127.0.0.11 valid=5s;
server {
  listen 80;
  location / {
    set $up http://app1:5678;
    proxy_pass $up;
    add_header X-Served-By $upstream_addr;
  }
}
```
(Une variable dans `proxy_pass` force la résolution dynamique ; chaque requête peut aller vers une IP différente.) `for i in $(seq 6); do curl -s localhost:8080; done`.

## Lab 8.4
1. Les deux conteneurs sont sur le bridge par défaut → créer un réseau utilisateur et y mettre les deux.
2. L'app écoute sur `127.0.0.1` → `0.0.0.0` (ex. Flask `host="0.0.0.0"`).
3. Port hôte occupé : `ss -tlnp | grep 8080`, choisir un autre port.
4. Utiliser un second réseau non interne ou un proxy sortant dédié.

## Lab 8.5
Le noyau interdit la communication directe entre l'interface parente et ses sous-interfaces macvlan. Contournement : `ip link add macv0 link eth0 type macvlan mode bridge`, attribuer une IP et router vers le sous-réseau des conteneurs.
