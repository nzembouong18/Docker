# Solutions — Module 11

## Lab 11.1
**Problèmes** : `--privileged` (tous les droits + périphériques) ; `--network host` (pas d'isolation réseau) ; `docker.sock` monté (root hôte) ; `-v /:/host` (tout le disque hôte, en écriture) ; mot de passe en clair dans `-e` ; `-u root` explicite ; `nginx:latest` non épinglé ; pas de limites ni de FS en lecture seule.

**Démonstrations** :
```bash
docker exec vuln cat /host/etc/shadow | head -1
docker exec vuln sh -c 'apt-get update -qq && apt-get install -y -qq docker.io >/dev/null && docker run --rm alpine echo "conteneur frère créé"'
```

**Version sûre** :
```bash
docker run -d --name safe -p 8080:8080 \
  --user 101:101 --read-only --tmpfs /tmp \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --pids-limit 100 --memory 128m --cpus 0.5 \
  nginxinc/nginx-unprivileged:1.27-alpine
```
(nginx-unprivileged écoute sur 8080 ; le mot de passe de la base, si nécessaire, est fourni par un secret et non par `-e`.)

## Lab 11.2
Preuves : `docker exec c id` (uid≠0) ; `docker exec c touch /x` (échec RO) ; `docker inspect -f '{{.HostConfig.CapDrop}} {{.HostConfig.SecurityOpt}}' c` ; `docker stats --no-stream` (limites) ; `docker inspect -f '{{.Config.Image}}' c` (digest) ; `docker inspect -f '{{.State.Health.Status}}' c`.

## Lab 11.3
Ordres de grandeur : `python:3.9` + flask 1.0 : dizaines de CVE HIGH/CRITICAL ; `python:3.12-slim` : quelques-unes (surtout non corrigées) ; `distroless` : très peu. `syft monimage -o table | grep -i openssl`.

## Lab 11.4
```bash
docker history --no-trunc img | grep -i secret
docker inspect img | grep -i secret
docker save img | tar -xO --wildcards '*/layer.tar' | tar -t | head      # couches
trivy image --scanners secret img
```
Un `COPY secret` suivi de `RUN rm secret` laisse le fichier dans la couche précédente. Correctif : `RUN --mount=type=secret,id=s …`.

## Lab 11.5
Avec rootless, le « root » du conteneur correspond à votre UID (ex. 1000) sur l'hôte, d'où une évasion moins grave. Limitations : ports < 1024 (`sysctl net.ipv4.ip_unprivileged_port_start`), réseau via slirp4netns/pasta (plus lent), `overlay2` nécessite noyau ≥ 5.11 ou fuse-overlayfs, pas de `--privileged` réel, cgroups v2 requis pour les limites.

## Lab 11.6
Règle Falco typique : « Terminal shell in container » et « Write below etc ». Sans Falco : `docker events --filter event=exec_start`.
