# Aide-mémoire Docker

## Conteneurs
```bash
docker run -d --name web -p 8080:80 -e K=V -v vol:/data --network net --restart unless-stopped nginx:1.27-alpine
docker run --rm -it image sh                 # jetable et interactif
docker ps [-a] | start | stop | restart | pause | unpause | kill | rm [-f]
docker logs -f --tail 100 -t web
docker exec -it web sh | docker attach web
docker inspect -f '{{.State.Status}} {{.State.ExitCode}}' web
docker top web | docker stats [--no-stream] | docker diff web | docker port web
docker cp web:/etc/nginx/nginx.conf . | docker update --memory 1g --cpus 2 web
docker events [--filter event=die]
```

## Images
```bash
docker pull|push|images|rmi|history|inspect|tag|save|load|search
docker build -t app:1.0 [-f Dockerfile] [--target étape] [--build-arg K=V] [--no-cache] [--platform linux/arm64] .
docker buildx build --platform linux/amd64,linux/arm64 -t reg/app:1.0 --push .
docker buildx imagetools inspect reg/app:1.0
docker image prune [-a] | docker builder prune
```

## Volumes & réseaux
```bash
docker volume create|ls|inspect|rm|prune
docker network create [--internal] [--subnet 10.1.0.0/24] net
docker network ls|inspect|connect|disconnect|rm|prune
```

## Compose
```bash
docker compose up -d [--build] [--wait] [--scale web=3] [--profile debug]
docker compose down [-v] | ps | logs -f svc | exec svc sh | run --rm svc cmd
docker compose config | build | pull | push | watch | restart svc | stop | start
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

## Nettoyage & diagnostic
```bash
docker system df [-v] | docker system prune [-a] [--volumes]
docker container prune | image prune | volume prune | network prune
docker info | docker version | docker context ls
journalctl -u docker -f
```

## Dockerfile (essentiel)
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
COPY . .

FROM python:3.12-slim
COPY --from=build /usr/local /usr/local
COPY --from=build /app /app
WORKDIR /app
USER 10001
EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request;urllib.request.urlopen('http://localhost:8000/health')"
ENTRYPOINT ["python"]
CMD ["app.py"]
```

## Formats de sortie
`--format '{{.Names}}\t{{.Status}}'` · `-f '{{json .Config}}' | jq` · `docker ps --format 'table {{.Names}}\t{{.Ports}}'`

## Codes de sortie
`0` ok · `1` erreur appli · `125` erreur docker · `126` non exécutable · `127` introuvable · `137` SIGKILL/OOM · `139` segfault · `143` SIGTERM

## Raccourcis de sécurité
`--user 10001 --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges:true --pids-limit 100 -m 256m --cpus 1`

## Réseau : rappel
Même réseau utilisateur ⇒ joindre par **nom:port-interne**. `localhost` = le conteneur lui-même. L'app doit écouter sur `0.0.0.0`.
