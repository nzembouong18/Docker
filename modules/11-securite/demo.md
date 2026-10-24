# Démos — Module 11

> ⚠️ Les démos d'attaque se font **uniquement sur votre machine de formation**.

## Démo 1 — Pourquoi `docker.sock` = root (5 min)
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock docker:cli \
  docker run --rm -v /:/hote alpine cat /hote/etc/shadow | head -2
```
Un conteneur ayant le socket peut lancer un conteneur montant `/` de l'hôte.

## Démo 2 — `--privileged` (5 min)
```bash
docker run --rm alpine sh -c 'ip link add dummy0 type dummy' ; echo "code=$?"        # refusé
docker run --rm --privileged alpine sh -c 'ip link add dummy0 type dummy && echo créé'
docker run --rm --privileged alpine sh -c 'ls /dev | wc -l'; docker run --rm alpine sh -c 'ls /dev | wc -l'
```

## Démo 3 — Capabilities (5 min)
```bash
docker run --rm alpine sh -c 'apk add -q libcap && capsh --print | head -3'
docker run --rm --cap-drop ALL alpine chown 1000 /etc/hostname || echo "chown refusé (CAP_CHOWN retirée)"
docker run --rm --cap-drop ALL --cap-add NET_RAW alpine ping -c1 127.0.0.1   # NET_RAW ajoutée: ping fonctionne
docker run --rm --cap-drop ALL alpine ping -c1 127.0.0.1 || echo "ping refusé sans NET_RAW"
# Note: Docker abaisse net.ipv4.ip_unprivileged_port_start à 0 dans les conteneurs : bind(80) fonctionne même sans NET_BIND_SERVICE
```

## Démo 4 — Root dans le conteneur vs utilisateur (5 min)
```bash
docker run --rm -v /tmp:/h alpine sh -c 'echo pwn > /h/fichier-root'; ls -l /tmp/fichier-root
docker run --rm -u 10001 -v /tmp:/h alpine sh -c 'echo x > /h/autre' || echo "refusé"
```

## Démo 5 — FS en lecture seule + no-new-privileges (5 min)
```bash
docker run --rm --read-only alpine sh -c 'echo x > /etc/x' || echo "RO ✅"
docker run --rm --security-opt no-new-privileges alpine sh -c 'grep NoNewPrivs /proc/self/status'
```

## Démo 6 — seccomp personnalisé (5 min)
```bash
docker run --rm --security-opt seccomp=$PWD/seccomp-no-mkdir.json alpine mkdir /x
docker run --rm alpine mkdir /x && echo "profil par défaut: ok"
```

## Démo 7 — Secrets : où fuient-ils ? (5 min)
```bash
docker run -d --name leak -e API_KEY=abc123 alpine sleep 300
docker inspect -f '{{.Config.Env}}' leak
docker exec leak cat /proc/1/environ | tr '\0' '\n'
docker rm -f leak
```
Comparez avec un secret monté (module 09 : `/run/secrets/…`).

## Démo 8 — Scanner (10 min)
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.57.0 image --severity CRITICAL,HIGH python:3.8
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.57.0 image --severity CRITICAL,HIGH python:3.12-slim
docker run --rm -v "$PWD":/w aquasec/trivy:0.57.0 config /w
```

## Démo 9 — Conteneur durci complet (5 min)
```bash
cd hardened && docker compose up -d && sleep 3
curl -sI localhost:8080 | head -1
docker compose exec web id ; docker compose exec web touch /x || echo "RO ✅"
docker inspect -f 'caps drop={{.HostConfig.CapDrop}} ro={{.HostConfig.ReadonlyRootfs}}' hardened-web-1
docker compose down
```

## Démo 10 — docker-bench-security (10 min)
```bash
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -v /var/lib:/var/lib:ro -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /etc:/etc:ro docker/docker-bench-security
```
