# Module 02 — Installation et prise en main de la CLI

> **Durée** : 2 h · **Niveau** : 🟢

## 1. Installer Docker

### Linux (Ubuntu/Debian) — Docker Engine

```bash
# 1. Dépôt officiel
sudo apt-get update && sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
 | sudo tee /etc/apt/sources.list.d/docker.list

# 2. Installation
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Utiliser docker sans sudo (reconnexion nécessaire)
sudo usermod -aG docker $USER && newgrp docker

# 4. Démarrage automatique
sudo systemctl enable --now docker
```

> ⚠️ Le groupe `docker` équivaut à un accès root. À réserver à des utilisateurs de confiance (voir module 11 : mode *rootless*).

Alternative rapide (labos uniquement) : `curl -fsSL https://get.docker.com | sh`.

### macOS / Windows

Installez **Docker Desktop** (WSL2 requis sous Windows). Alternatives : Colima / Rancher Desktop / Podman Desktop.

### Sans installation

[Play with Docker](https://labs.play-with-docker.com) ou GitHub Codespaces.

### Vérification

```bash
docker version          # client ET serveur doivent répondre
docker info             # détails: storage driver, cgroup version, runtimes
docker compose version
docker run hello-world
```

## 2. Anatomie d'une commande

```
docker  <objet>  <action>  [options]  [arguments]
docker  container run      -d -p 80:80   nginx
```

Depuis Docker 1.13 la syntaxe est « objet action » (`docker container ls`) ; les anciens alias (`docker ps`, `docker run`) restent valides et très utilisés.

Objets : `container`, `image`, `volume`, `network`, `system`, `builder`, `compose`, `context`…

Aide : `docker --help`, `docker run --help`, `docker image --help`.

## 3. `docker run` : la commande centrale

```bash
docker run [OPTIONS] IMAGE [COMMANDE] [ARGS...]
```

Ce qu'elle fait : **pull** (si absente) → **create** → **start** → (attach).

| Option | Rôle | Exemple |
|--------|------|---------|
| `-d` | détaché (arrière-plan) | `docker run -d nginx` |
| `-it` | interactif + TTY (shell) | `docker run -it alpine sh` |
| `--name` | nom du conteneur | `--name web` |
| `-p H:C` | publie le port C du conteneur sur H de l'hôte | `-p 8080:80` |
| `-e K=V` | variable d'environnement | `-e MODE=prod` |
| `-v` | monte volume/dossier | `-v data:/var/lib/x` |
| `--rm` | supprime à l'arrêt | idéal pour tests |
| `--network` | réseau | `--network mon-reseau` |
| `-m`, `--cpus` | limites ressources | `-m 256m --cpus 1` |
| `--restart` | politique de redémarrage | `--restart unless-stopped` |

### Premier exemple : un serveur web

```bash
docker run -d --name web -p 8080:80 nginx:alpine
curl http://localhost:8080          # page d'accueil nginx
docker logs web                     # logs
docker exec -it web sh              # shell dans le conteneur
docker stop web && docker rm web
```

## 4. Commandes de gestion courantes

| Action | Commande |
|--------|----------|
| Conteneurs en cours | `docker ps` |
| Tous les conteneurs | `docker ps -a` |
| Arrêter / démarrer / redémarrer | `docker stop|start|restart NOM` |
| Supprimer | `docker rm [-f] NOM` |
| Logs (suivre) | `docker logs -f --tail 100 NOM` |
| Exécuter une commande | `docker exec [-it] NOM CMD` |
| Détails JSON | `docker inspect NOM` |
| Filtre de format | `docker inspect -f '{{.NetworkSettings.IPAddress}}' NOM` |
| Processus | `docker top NOM` |
| Ressources | `docker stats` |
| Copier des fichiers | `docker cp NOM:/chemin ./local` |
| Images locales | `docker images` / `docker image ls` |
| Nettoyer | `docker system prune` (⚠️) |
| Occupation disque | `docker system df` |

## 5. Comprendre `docker run` : exemples

```bash
# Éphémère: affiche et disparaît
docker run --rm alpine echo "Bonjour Docker"

# Shell interactif jetable
docker run --rm -it ubuntu:24.04 bash

# Base de données de dev
docker run -d --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16-alpine

# Variable + commande personnalisée
docker run --rm -e NOM=Awa alpine sh -c 'echo "Salut $NOM"'
```

### Premier plan vs arrière-plan

Sans `-d`, le terminal est attaché à la sortie du conteneur ; `Ctrl+C` l'arrête. Pour se détacher d'un conteneur lancé avec `-it` sans l'arrêter : `Ctrl+P` puis `Ctrl+Q`.

### Un conteneur vit tant que son processus principal vit

```bash
docker run alpine echo hi       # processus terminé → conteneur "Exited (0)"
docker run -d alpine sleep 30   # vit 30 s
docker run -d ubuntu            # s'arrête aussitôt (bash sans TTY)
```

## 6. Contextes et variables

- `docker context ls` : cibler un autre démon (SSH distant) : `docker context create prod --docker "host=ssh://user@serveur"` puis `docker --context prod ps`.
- `DOCKER_HOST`, `DOCKER_CONFIG`, `DOCKER_BUILDKIT` : variables utiles.
- Config client : `~/.docker/config.json`.

## 7. Bonnes habitudes dès le début

- **Toujours nommer** vos conteneurs et **toujours pinner** les tags (`nginx:1.27-alpine`, pas `latest`).
- Utilisez `--rm` pour les tests.
- Ne mettez pas de secrets en clair dans l'historique du shell.
- Nettoyez régulièrement : `docker system prune` (jamais `-a --volumes` en production sans réfléchir).

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 03](../03-images-registres/)
