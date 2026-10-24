# Solutions — Module 03

## Lab 3.1
Ordres de grandeur : `python:3.12` ≈ 1 Go (Debian complet + outils de build), `-slim` ≈ 130 Mo, `-alpine` ≈ 50 Mo. Pour numpy/pandas préférez **slim** : sur Alpine (musl) les *wheels* binaires manylinux ne sont pas utilisables, la compilation allonge les builds et la taille finale n'est pas forcément meilleure.

## Lab 3.2
```bash
docker image inspect nginx:1.27-alpine --format '
CMD={{json .Config.Cmd}}
PORTS={{json .Config.ExposedPorts}}
USER={{json .Config.User}}
CREATED={{.Created}}
ARCH={{.Architecture}}'
```
`User` est vide → root par défaut. CMD : `["nginx","-g","daemon off;"]`. Ports : `80/tcp`.

## Lab 3.3
```bash
echo $TOKEN | docker login -u USER --password-stdin
docker tag alpine:3.20 USER/alpine-formation:1.0
docker push USER/alpine-formation:1.0
docker rmi USER/alpine-formation:1.0 && docker pull USER/alpine-formation:1.0
```

## Lab 3.4
```bash
docker run -d -p 5000:5000 --name registry -v registry-data:/var/lib/registry registry:2
for t in 1 2; do docker tag alpine:3.20 localhost:5000/lab/alpine:$t; docker push localhost:5000/lab/alpine:$t; done
curl localhost:5000/v2/_catalog
curl localhost:5000/v2/lab/alpine/tags/list
docker restart registry && curl localhost:5000/v2/_catalog   # toujours là grâce au volume
```
Suppression : récupérer le digest (`curl -I -H 'Accept: application/vnd.oci.image.manifest.v1+json' …/manifests/1`), `DELETE /v2/lab/alpine/manifests/<digest>` (nécessite `REGISTRY_STORAGE_DELETE_ENABLED=true`), puis `docker exec registry registry garbage-collect /etc/docker/registry/config.yml`.

## Lab 3.5
```bash
docker images --digests alpine
docker run --rm alpine@sha256:... cat /etc/alpine-release
```
Un tag peut être republié (même `3.20` reçoit des patchs, ou compromis) ; le digest identifie un contenu unique. Compromis : il faut automatiser les mises à jour (Renovate/Dependabot).
