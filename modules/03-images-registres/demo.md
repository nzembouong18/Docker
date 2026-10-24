# Démos — Module 03

## Démo 1 — Partage de couches (5 min)
```bash
docker pull python:3.12-slim
docker pull python:3.12-alpine
docker pull node:22-alpine
docker images
docker system df -v | head -30        # colonnes SHARED SIZE / UNIQUE SIZE
```
Observez que les images partageant une base ne dupliquent pas les couches.

## Démo 2 — Lire une image (5 min)
```bash
docker image history --no-trunc nginx:1.27-alpine | head
docker image inspect nginx:1.27-alpine --format '{{json .Config.Cmd}} {{json .Config.ExposedPorts}}'
docker image inspect nginx:1.27-alpine --format '{{len .RootFS.Layers}} couches'
```

## Démo 3 — Tag vs digest (5 min)
```bash
docker pull alpine:3.20
docker images --digests alpine
docker tag alpine:3.20 alpine:ma-version
docker images alpine                 # même IMAGE ID, deux noms
docker run --rm alpine@sha256:<digest-copié> cat /etc/alpine-release
```

## Démo 4 — `docker commit` : pourquoi c'est opaque (5 min)
```bash
docker run --name tmp ubuntu:24.04 bash -c "apt-get update -qq && apt-get install -y -qq curl"
docker commit tmp ubuntu-curl:demo
docker history ubuntu-curl:demo
docker rm tmp
```
Comparez avec un Dockerfile équivalent : la recette n'est pas versionnable avec `commit`.

## Démo 5 — Registre privé local (10 min)
```bash
docker run -d -p 5000:5000 --name registry registry:2
docker pull busybox
docker tag busybox localhost:5000/team/busybox:1.0
docker push localhost:5000/team/busybox:1.0
curl -s localhost:5000/v2/_catalog
curl -s localhost:5000/v2/team/busybox/tags/list
docker rmi localhost:5000/team/busybox:1.0 busybox
docker pull localhost:5000/team/busybox:1.0       # re-téléchargé depuis le registre local
docker rm -f registry
```

## Démo 6 — Export / import hors ligne (5 min)
```bash
docker save -o alpine.tar alpine:3.20
ls -lh alpine.tar
docker rmi alpine:3.20 && docker load -i alpine.tar
```

## Démo 7 — Manifest multi-arch (5 min)
```bash
docker buildx imagetools inspect alpine:3.20
```
