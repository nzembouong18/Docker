# Module 06 — Dockerfile avancé : multi-stage, BuildKit, cache, multi-arch

> **Durée** : 3 h · **Niveau** : 🟡 · Exemples : [`go-app/`](go-app/) et [`python-multistage/`](python-multistage/).

## 1. Le problème des images « tout-en-un »

Compiler une application nécessite des compilateurs, des en-têtes, des outils… qui sont **inutiles à l'exécution**. Les laisser dans l'image finale :
- gonfle l'image (Go : ~850 Mo vs ~10 Mo),
- augmente la surface d'attaque (shell, gcc, curl…),
- ralentit pulls et déploiements.

## 2. Builds multi-étapes (multi-stage)

Un Dockerfile peut contenir plusieurs `FROM`. Chaque `FROM` démarre une **étape**. On copie uniquement les artefacts utiles vers l'étape finale.

```dockerfile
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/app .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
ENTRYPOINT ["/app"]
```

Commandes utiles :
```bash
docker build --target build -t app:builder .   # s'arrêter à une étape (debug, tests)
docker build --target test .                    # étape de tests
```
`COPY --from=<étape|image>` copie aussi depuis une image externe : `COPY --from=nginx:alpine /etc/nginx/nginx.conf /tmp/`.

### Motifs courants

| Langage | Étape de build | Étape finale |
|---------|----------------|--------------|
| Go / Rust | `golang`, `rust` | `scratch` / `distroless/static` |
| Java | `maven`/`gradle` + JDK | JRE (`eclipse-temurin:21-jre`) |
| Node (front) | `node` (build) | `nginx:alpine` (fichiers statiques) |
| Node (back) | `npm ci` complet | `npm ci --omit=dev` + code compilé |
| Python | venv/wheels dans `builder` | `python:slim` + `COPY --from=builder /opt/venv` |

Mesurez :
```bash
docker build -f Dockerfile.single -t go:single go-app/   # ~850 Mo
docker build -t go:multi go-app/                         # ~10 Mo
docker images go
```

## 3. BuildKit

BuildKit est le moteur de build par défaut (Docker ≥ 23). Il apporte : exécution **parallèle** des étapes indépendantes, cache amélioré, **mounts** spéciaux, secrets, SSH forwarding, cache distant, multi-plateforme.

Activer la syntaxe moderne en tête de fichier :
```dockerfile
# syntax=docker/dockerfile:1
```

### 3.1 Cache mounts — accélérer les gestionnaires de paquets
```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
RUN --mount=type=cache,target=/var/cache/apt --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y gcc
RUN --mount=type=cache,target=/go/pkg/mod go mod download
```
Le cache vit **hors de l'image** et persiste entre les builds.

### 3.2 Secrets de build — jamais dans l'image
```dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
```
```bash
docker build --secret id=npmrc,src=$HOME/.npmrc .
```
Le secret n'est disponible que durant ce `RUN` et n'apparaît ni dans les couches ni dans `history`.

### 3.3 SSH forwarding — dépôts privés
```dockerfile
RUN --mount=type=ssh git clone git@github.com:org/prive.git
```
```bash
docker build --ssh default .
```

### 3.4 Bind mounts de build
```dockerfile
RUN --mount=type=bind,source=requirements.txt,target=/tmp/requirements.txt pip install -r /tmp/requirements.txt
```

### 3.5 Heredocs
```dockerfile
RUN <<EOF
set -e
apt-get update
apt-get install -y --no-install-recommends curl
rm -rf /var/lib/apt/lists/*
EOF

COPY <<EOF /etc/app.conf
mode=prod
EOF
```

## 4. Optimiser les builds

1. **Ordre des instructions** (module 05).
2. **`.dockerignore`** rigoureux.
3. **Étapes parallèles** : plusieurs étapes indépendantes se construisent simultanément.
4. **Cache mounts** pour les dépendances.
5. **Cache en CI** (les runners sont éphémères) :
   ```bash
   docker buildx build --cache-from type=registry,ref=ghcr.io/org/app:cache \
                       --cache-to   type=registry,ref=ghcr.io/org/app:cache,mode=max .
   # ou, avec GitHub Actions : type=gha
   ```
6. **Épingler les versions** et utiliser des digests.
7. **Réduire les couches inutiles**, mais ne sacrifiez pas la lisibilité.

## 5. Images minimales

| Option | Quand |
|--------|-------|
| `alpine` | simple, petit, a un shell et apk ; musl peut surprendre |
| `debian-slim` | meilleure compatibilité |
| `distroless` | prod : pas de shell, utilisateur `nonroot`, debug via `:debug` ou conteneur éphémère |
| `scratch` | binaire statique (`CGO_ENABLED=0`), copiez les certificats CA/tzdata si besoin |
| Chainguard / Wolfi | images durcies, SBOM, peu de CVE |

Pour `scratch`, pensez à `COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/` et à un `USER` numérique (`USER 10001`).

## 6. Builds multi-plateformes avec `buildx`

```bash
docker buildx create --name multi --use --bootstrap
docker run --privileged --rm tonistiigi/binfmt --install all     # émulation QEMU

docker buildx build --platform linux/amd64,linux/arm64 \
   -t ghcr.io/org/app:1.0 --push .
docker buildx imagetools inspect ghcr.io/org/app:1.0
```

Pour des builds rapides (sans émulation) pour un langage compilé, utilisez la compilation croisée comme dans [`go-app/Dockerfile`](go-app/Dockerfile) :
`FROM --platform=$BUILDPLATFORM` + `ARG TARGETOS TARGETARCH`.

Variables automatiques : `BUILDPLATFORM`, `TARGETPLATFORM`, `TARGETOS`, `TARGETARCH`, `TARGETVARIANT`.

## 7. Bake : builds déclaratifs

`docker-bake.hcl` décrit plusieurs cibles :
```hcl
group "default" { targets = ["api", "worker"] }
target "api" {
  context    = "./api"
  tags       = ["ghcr.io/org/api:dev"]
  platforms  = ["linux/amd64", "linux/arm64"]
}
target "worker" { context = "./worker"  tags = ["ghcr.io/org/worker:dev"] }
```
```bash
docker buildx bake            # construit toutes les cibles
docker buildx bake --push api
```

## 8. Provenance, SBOM, attestations

```bash
docker buildx build --sbom=true --provenance=mode=max -t ghcr.io/org/app:1.0 --push .
```
Ils attachent à l'image la liste des composants (SBOM) et la preuve de comment elle a été construite (SLSA). Voir module 11.

## 9. Diagnostiquer un build

```bash
docker buildx build --progress=plain .          # logs complets
docker buildx du                                 # taille du cache
docker buildx prune --filter until=24h           # nettoyer
docker build --no-cache .                        # ignorer le cache
docker build --check .                           # lint intégré du Dockerfile
```
Outils externes : **dive** (explorer les couches), **hadolint** (lint), **docker scout / trivy** (CVE).

```bash
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive go:multi
```

## 10. À retenir

- Multi-stage = build lourd, runtime léger.
- BuildKit : cache mounts, secrets, SSH, heredocs, parallélisme.
- Cache distant indispensable en CI.
- `buildx` pour le multi-arch ; SBOM & provenance pour la supply chain.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 07](../07-volumes/)
