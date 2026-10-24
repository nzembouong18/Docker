# Labos — Module 06

## Lab 6.1 — Multi-stage Go (20 min)
1. Construisez `go-app/Dockerfile.single` et `go-app/Dockerfile`; comparez tailles et nombre de CVE (`docker scout quickview` ou `trivy image`).
2. Remplacez l'image finale par `scratch` : que faut-il ajouter pour que l'app fonctionne (utilisateur, certificats) ?
3. Essayez `docker exec -it <c> sh` sur chaque variante.

## Lab 6.2 — Front-end statique (30 min)
Créez une mini-app web (HTML/JS, ou `npm create vite@latest`). Écrivez un Dockerfile en 2 étapes : `node:22-alpine` (build) → `nginx:1.27-alpine` (servir `dist/`). Ajoutez une configuration nginx qui redirige toutes les routes vers `index.html` (SPA) et un healthcheck. Objectif : image finale < 60 Mo.

## Lab 6.3 — Optimiser un build lent (30 min)
Partez de ce Dockerfile et ramenez le temps de **rebuild après modification du code** sous 5 secondes :
```dockerfile
FROM python:3.12
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y gcc
CMD python main.py
```
Mesurez avant/après (`time docker build …`). Mettez en œuvre : ordre des couches, `.dockerignore`, cache mount, image slim.

## Lab 6.4 — Secrets de build (20 min)
Écrivez un Dockerfile qui télécharge un fichier protégé par un en-tête `Authorization: Bearer <token>` (vous pouvez simuler avec un petit serveur local) **sans** que le token apparaisse dans `docker history`, `docker inspect` ni le système de fichiers de l'image. Prouvez-le avec `docker run --rm img grep -r <token> / 2>/dev/null`.

## Lab 6.5 — Multi-plateforme & attestations (25 min)
1. Construisez `go-app` pour `linux/amd64` et `linux/arm64` vers un registre local avec `--sbom=true --provenance=mode=max`.
2. Inspectez le manifest list (`imagetools inspect`).
3. Lancez l'image arm64 sur un hôte amd64 (QEMU) : `docker run --platform linux/arm64 … uname -m`.

## Lab 6.6 — Docker Bake (15 min)
Écrivez un `docker-bake.hcl` avec 2 cibles (`go-app` et `python-multistage`) et un groupe `default`. Construisez-les d'une commande.

> Corrigés : [solutions.md](solutions.md)
