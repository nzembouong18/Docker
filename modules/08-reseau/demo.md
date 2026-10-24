# Démos — Module 08

## Démo 1 — Bridge par défaut vs utilisateur (10 min)
```bash
docker run -d --name a1 alpine sleep 300 && docker run -d --name a2 alpine sleep 300
docker exec a1 ping -c1 a2                   # ❌ bad address
docker exec a1 ping -c1 $(docker inspect -f '{{.NetworkSettings.IPAddress}}' a2)   # ✅ par IP
docker rm -f a1 a2

docker network create demo-net
docker run -d --name b1 --network demo-net alpine sleep 300
docker run -d --name b2 --network demo-net alpine sleep 300
docker exec b1 ping -c1 b2                   # ✅ par nom
docker exec b1 cat /etc/resolv.conf          # nameserver 127.0.0.11
```

## Démo 2 — Isolation entre réseaux (5 min)
```bash
docker network create autre
docker run -d --name c1 --network autre alpine sleep 300
docker exec b1 ping -c1 -W1 c1               # ❌
docker network connect autre b1
docker exec b1 ping -c1 c1                   # ✅ b1 est sur deux réseaux
docker rm -f b1 b2 c1; docker network rm demo-net autre
```

## Démo 3 — Publication de ports et iptables (5 min)
```bash
docker run -d --name web -p 8080:80 nginx:alpine
docker port web
sudo iptables -t nat -L DOCKER -n | grep 8080
ss -tlnp | grep 8080
docker rm -f web
docker run -d --name web -p 127.0.0.1:8080:80 nginx:alpine   # inaccessible depuis l'extérieur
docker rm -f web
```

## Démo 4 — App qui écoute sur 127.0.0.1 (piège) (5 min)
```bash
docker run -d --name loc -p 9000:9000 python:3.12-alpine python -m http.server 9000 --bind 127.0.0.1
curl -m2 localhost:9000 || echo "❌ inaccessible"
docker rm -f loc
docker run -d --name ok -p 9000:9000 python:3.12-alpine python -m http.server 9000 --bind 0.0.0.0
curl -sI localhost:9000 | head -1; docker rm -f ok
```

## Démo 5 — Reverse proxy (10 min)
```bash
cd proxy-demo && docker compose up -d
curl localhost:8080/ ; curl localhost:8080/app1/ ; curl localhost:8080/app2/
docker compose down
```

## Démo 6 — Réseau interne (5 min)
```bash
docker network create --internal backend
docker run --rm --network backend alpine ping -c1 -W2 1.1.1.1 || echo "pas de sortie ✅"
docker network rm backend
```

## Démo 7 — Debug avec netshoot (10 min)
```bash
docker run -d --name web nginx:alpine
docker run --rm -it --network container:web nicolaka/netshoot
  # ss -tlnp ; curl localhost ; tcpdump -i eth0 -n port 80
docker rm -f web
```

## Démo 8 — Mode host (Linux) (3 min)
```bash
docker run -d --name h --network host nginx:alpine
curl localhost:80 ; ss -tlnp | grep ':80 '
docker rm -f h
```
