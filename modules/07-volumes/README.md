# Module 07 — Volumes et gestion des données

> **Durée** : 2 h · **Niveau** : 🟡

## 1. Pourquoi le stockage est un sujet

La couche inscriptible d'un conteneur est **éphémère** : supprimez le conteneur, les données disparaissent. Elle est aussi plus lente (copy-on-write) et couplée au cycle de vie du conteneur.

Pour persister ou partager des données, Docker propose 3 mécanismes :

| Type | Syntaxe | Géré par | Cas d'usage |
|------|---------|----------|-------------|
| **Volume** | `-v data:/chemin` ou `--mount type=volume,src=data,dst=/chemin` | Docker (`/var/lib/docker/volumes`) | Bases de données, données applicatives (**recommandé en prod**) |
| **Bind mount** | `-v /hôte/dossier:/chemin` | L'utilisateur | Développement (code source), config |
| **tmpfs** | `--tmpfs /tmp` / `--mount type=tmpfs,dst=/tmp` | RAM | Données sensibles/temporaires |

```
Conteneur
 ├─ /var/lib/postgresql/data ◀── Volume "pgdata"      (persistant, géré par Docker)
 ├─ /app                     ◀── Bind mount ./src     (dossier de l'hôte)
 └─ /run/secrets             ◀── tmpfs                (en mémoire, jamais sur disque)
```

## 2. Volumes

```bash
docker volume create pgdata
docker volume ls
docker volume inspect pgdata          # Mountpoint, Driver, Labels
docker run -d --name pg -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=x postgres:16-alpine
docker rm -f pg                        # le volume survit
docker run -d --name pg2 -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=x postgres:16-alpine   # données retrouvées
docker volume rm pgdata                # refuse s'il est utilisé
docker volume prune                    # supprime les volumes non utilisés (⚠️ données !)
```

- Un volume **nommé** est créé automatiquement au premier usage. Un volume **anonyme** (`-v /chemin`) reçoit un nom aléatoire : difficile à gérer, à éviter.
- Si le volume est **vide** au premier montage, Docker y **copie le contenu** du répertoire cible de l'image (comportement d'initialisation). Ce n'est pas vrai pour un bind mount (qui masque le contenu de l'image).
- Un volume peut être partagé entre conteneurs : `--volumes-from` ou le même nom.
- **Drivers de volume** : `local` (défaut), NFS, CIFS, plugins (REX-Ray, Portworx, cloud).

```bash
# Volume NFS
docker volume create --driver local \
  --opt type=nfs --opt o=addr=10.0.0.5,rw --opt device=:/exports/data nfsdata
```

## 3. Bind mounts

```bash
docker run -v "$PWD":/app -w /app node:22-alpine npm test
docker run -v "$PWD/conf.yml":/etc/app/conf.yml:ro app      # lecture seule
```

Points d'attention :
- Le chemin hôte doit exister avec `-v` (Docker le crée en root sinon) ; `--mount` échoue s'il n'existe pas (plus sûr).
- **Permissions** : l'UID du conteneur doit pouvoir lire/écrire (`-u $(id -u):$(id -g)` ou `chown`).
- **SELinux** (Fedora/RHEL) : ajoutez `:z` ou `:Z` (`-v "$PWD":/app:Z`).
- Performances sur macOS/Windows : le partage de fichiers est plus lent (préférez des volumes pour `node_modules`).
- `:ro` dès que possible.

## 4. tmpfs

```bash
docker run --rm --tmpfs /tmp:rw,size=64m,mode=1777 alpine df -h /tmp
```
Données en RAM, perdues à l'arrêt. Idéal avec `--read-only`.

## 5. `-v` vs `--mount`

`--mount` est explicite et plus lisible :

```bash
docker run --mount type=volume,source=pgdata,target=/var/lib/postgresql/data,readonly ...
docker run --mount type=bind,source="$PWD",target=/app ...
docker run --mount type=tmpfs,target=/tmp,tmpfs-size=64m ...
```

## 6. Sauvegarde et restauration d'un volume

```bash
# Sauvegarde dans une archive tar.gz
docker run --rm -v pgdata:/data:ro -v "$PWD":/backup alpine \
  tar czf /backup/pgdata-$(date +%F).tar.gz -C /data .

# Restauration dans un nouveau volume
docker volume create pgdata-restore
docker run --rm -v pgdata-restore:/data -v "$PWD":/backup alpine \
  tar xzf /backup/pgdata-2025-01-01.tar.gz -C /data

# Migration d'un volume à un autre
docker run --rm -v old:/from:ro -v new:/to alpine sh -c 'cp -a /from/. /to/'
```

> ⚠️ Pour une base de données, privilégiez un **dump logique** (`pg_dump`, `mysqldump`) ou un snapshot cohérent plutôt qu'une copie à chaud des fichiers.

```bash
docker exec pg pg_dump -U postgres formation > formation.sql
docker exec -i pg psql -U postgres formation < formation.sql
```

## 7. Permissions et utilisateurs

Un volume vide hérite des permissions du répertoire de l'image (copie initiale). Si l'application tourne en non-root, créez et `chown` le répertoire **dans l'image** :

```dockerfile
RUN mkdir -p /data && chown 10001:10001 /data
VOLUME /data        # (optionnel)
USER 10001
```

Pour des bind mounts, alignez l'UID/GID, ou utilisez `--user`. En mode rootless / userns-remap, les UID sont décalés.

## 8. L'instruction `VOLUME` : prudence

`VOLUME /data` crée un volume **anonyme** à chaque `docker run` si vous n'en fournissez pas. Elle empêche aussi toute modification de `/data` dans les `RUN` suivants du Dockerfile. Préférez documenter le chemin et laisser l'utilisateur monter un volume nommé.

## 9. Ménage et diagnostic

```bash
docker system df -v                       # taille par volume
docker volume ls -f dangling=true         # volumes orphelins
docker ps -a --filter volume=pgdata       # qui utilise ce volume ?
sudo du -sh /var/lib/docker/volumes/*     # sur l'hôte
```

## 10. À retenir

- Données persistantes ⇒ **volumes nommés** ; développement ⇒ **bind mounts** ; secrets/temporaire ⇒ **tmpfs**.
- Sauvegardez par conteneur éphémère `tar` ou dump applicatif.
- Attention aux permissions (UID), à SELinux et aux volumes anonymes qui s'accumulent.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 08](../08-reseau/)
