# Module 03 — Images et registres

> **Durée** : 2 h · **Niveau** : 🟢

## 1. Qu'est-ce qu'une image ?

Une image est un **empilement de couches (layers) immuables** plus un fichier de configuration (JSON : commande par défaut, variables, ports exposés, utilisateur…) et un **manifest**.

```
┌─────────────────────────┐
│ Couche conteneur (RW)   │  ← créée au `docker run`, jetable
├─────────────────────────┤
│ COPY app/ /app          │  ┐
│ RUN pip install …       │  │ couches de l'image
│ RUN apt-get install …   │  │ (lecture seule,
│ Base: debian-slim       │  ┘  partagées entre images)
└─────────────────────────┘
```

Chaque couche est identifiée par un **hash (sha256)** de son contenu : si deux images partagent une couche, elle n'est stockée et téléchargée **qu'une fois**.

**Copy-on-Write** : quand un conteneur modifie un fichier d'une couche inférieure, il est d'abord copié dans la couche inscriptible.

## 2. Nommer une image

```
[registre/][espace-de-noms/]dépôt[:tag][@digest]
docker.io/library/nginx:1.27-alpine
ghcr.io/mon-org/mon-app:v1.2.0
registry.example.com:5000/equipe/api@sha256:ab12…
```

- **Tag** : étiquette *mutable* (`latest`, `1.27`, `alpine`). Peut pointer vers un autre contenu demain.
- **Digest** : empreinte *immuable* du manifest. Garantit exactement le même contenu.
- Sans registre → Docker Hub (`docker.io`). Sans espace de noms → `library/` (images officielles). Sans tag → `latest`.

### Bons choix de tags

| Pratique | Verdict |
|----------|---------|
| `python` / `python:latest` | ❌ imprévisible |
| `python:3.12` | ⚠️ patchs mineurs mouvants |
| `python:3.12.7-slim-bookworm` | ✅ précis |
| `python@sha256:…` | ✅✅ immuable (reproductibilité maximale) |

## 3. Variantes d'images de base

| Variante | Taille | Particularités |
|----------|--------|----------------|
| `debian`/`ubuntu` | ~ 80-120 Mo | Complet, glibc, apt |
| `-slim` | ~ 30-80 Mo | Debian allégée, bon compromis |
| `-alpine` | ~ 5-50 Mo | musl libc + apk. Petit, mais attention aux incompatibilités (wheels Python, DNS, performances) |
| `distroless` | ~ 2-20 Mo | Pas de shell/gestionnaire de paquets : surface d'attaque minimale |
| `scratch` | 0 | Image vide, pour binaires statiques (Go, Rust) |

## 4. Commandes clés

```bash
docker pull nginx:1.27-alpine            # télécharger
docker images                            # lister (docker image ls)
docker image inspect nginx:1.27-alpine   # métadonnées
docker image history nginx:1.27-alpine   # couches et commandes
docker tag nginx:1.27-alpine monnginx:v1 # ajouter un alias (même image)
docker rmi monnginx:v1                   # supprimer un tag
docker image prune                       # supprimer les images "dangling"
docker save -o nginx.tar nginx:alpine    # exporter (hors-ligne)
docker load -i nginx.tar                 # importer
docker search nginx                      # chercher sur Docker Hub
```

- **Dangling** : image sans tag (`<none>`), souvent un résidu de build.
- `docker images --digests` affiche les digests.
- `docker images --filter dangling=true`, `--format '{{.Repository}}:{{.Tag}} {{.Size}}'`.

## 5. Créer une image : 3 manières

1. **Dockerfile** + `docker build` (la bonne méthode — modules 05/06).
2. `docker commit` d'un conteneur modifié (à éviter : non reproductible, utile en debug/démo).
3. `docker import` d'une archive de système de fichiers (rare).

```bash
docker run -it --name tmp ubuntu bash
  # apt update && apt install -y curl ; exit
docker commit tmp ubuntu-curl:demo       # fonctionne mais opaque
```

## 6. Les registres

Un **registre** stocke et distribue des images (API HTTP « OCI Distribution »).

| Registre | Remarque |
|----------|----------|
| Docker Hub | Par défaut. Limites de pulls anonymes. Images officielles. |
| GitHub Container Registry (`ghcr.io`) | Intégré à GitHub, idéal avec Actions |
| Amazon ECR, Google Artifact Registry, Azure ACR | Cloud privés |
| Harbor, GitLab Registry, Nexus, Artifactory | Auto-hébergés |
| `registry:2` | Registre minimal officiel |

### Authentification et publication

```bash
docker login                                  # Docker Hub
docker login ghcr.io -u USER --password-stdin # avec un PAT : echo $TOKEN | docker login …
docker tag monapp:1.0 monuser/monapp:1.0
docker push monuser/monapp:1.0
docker logout
```

> 🔐 Les identifiants sont stockés dans `~/.docker/config.json` (en clair en base64 si pas de *credential helper*). Utilisez un helper (`pass`, `osxkeychain`, `wincred`) et des **tokens à portée limitée**.

### Registre privé local

```bash
docker run -d -p 5000:5000 --name registry --restart=always registry:2
docker tag alpine localhost:5000/alpine:demo
docker push localhost:5000/alpine:demo
curl http://localhost:5000/v2/_catalog
```

## 7. Comment fonctionne un pull ?

1. Le client demande le **manifest** du tag → liste des couches (digests) + config.
2. Pour chaque couche absente en local → téléchargement (en parallèle) du *blob*.
3. Vérification des hash, décompression, stockage dans `/var/lib/docker` (overlay2).

Ainsi, mettre à jour une image ne retélécharge que les couches modifiées.

## 8. Images multi-architectures

Un tag peut pointer vers un **manifest list** (index) : une entrée par plateforme (`linux/amd64`, `linux/arm64`…). Docker choisit celle de votre machine. Voir module 06 pour les construire avec `buildx`.

```bash
docker buildx imagetools inspect nginx:alpine
docker pull --platform linux/arm64 alpine
```

## 9. À retenir

- Image = couches immuables + config ; conteneur = image + couche RW.
- **Tag mutable, digest immuable** : pinnez en production.
- Préférez des images officielles, minimales et à jour.
- Le registre est l'artère de la chaîne de livraison : sécurisez-le.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 04](../04-conteneurs/)
