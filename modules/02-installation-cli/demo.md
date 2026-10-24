# Démos — Module 02

## Démo 1 — Du `hello-world` au serveur web (5 min)

```bash
docker run hello-world
docker run -d --name web -p 8080:80 nginx:1.27-alpine
docker ps
curl -s localhost:8080 | head -5
docker logs web
docker stop web && docker rm web
```

## Démo 2 — Cycle de vie complet (5 min)

```bash
docker create --name cycle alpine sleep 300     # état: created
docker ps -a --filter name=cycle
docker start cycle                              # running
docker pause cycle && docker ps                 # paused
docker unpause cycle
docker stop cycle                               # SIGTERM puis SIGKILL après 10 s
docker ps -a --filter name=cycle                # exited (143)
docker rm cycle
```

> Code de sortie `143` = 128 + 15 (SIGTERM) ; `137` = 128 + 9 (SIGKILL).

## Démo 3 — Shell éphémère et isolement du système de fichiers (5 min)

```bash
docker run --rm -it alpine sh
  / # cat /etc/os-release       # Alpine, même si l'hôte est Ubuntu
  / # touch /fichier-test && ls /
  / # exit
docker run --rm alpine ls /fichier-test      # n'existe plus : conteneur jetable
```

## Démo 4 — Variables d'environnement et publication de port (5 min)

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16-alpine
docker logs -f pg                       # attendre "ready to accept connections" puis Ctrl+C
docker exec -it pg psql -U postgres -c "select version();"
docker rm -f pg
```

## Démo 5 — Inspecter (5 min)

```bash
docker run -d --name i nginx:alpine
docker inspect i | head -50
docker inspect -f '{{.NetworkSettings.IPAddress}}' i
docker inspect -f '{{json .Config.Env}}' i
docker inspect -f '{{.State.Pid}} {{.State.StartedAt}}' i
docker stats --no-stream i
docker rm -f i
```

## Démo 6 — Contexte distant (optionnel)

```bash
docker context create prod --docker "host=ssh://user@mon-serveur"
docker --context prod ps
```
