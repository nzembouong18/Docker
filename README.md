# 🐳 Formation Docker — du débutant à l'expert (DevOps)

Formation complète, en français, **autoportante** : cours, démonstrations, labos corrigés, quiz et projet final.
Elle peut être suivie seul(e) ou utilisée par un formateur pour une session de 5 jours.

## 🎯 Objectifs

À la fin de la formation, vous saurez :

- Expliquer ce qu'est un conteneur (namespaces, cgroups, union filesystem) et en quoi il diffère d'une VM.
- Utiliser la CLI Docker au quotidien (images, conteneurs, volumes, réseaux).
- Écrire des **Dockerfile** propres, petits, rapides à construire et sécurisés (multi-stage, BuildKit, cache).
- Orchestrer des applications multi-conteneurs avec **Docker Compose**.
- Publier et distribuer des images (Docker Hub, GHCR, registre privé) et les intégrer dans une **CI/CD**.
- Sécuriser vos conteneurs et vos images (utilisateur non-root, scan, signature, SBOM, secrets).
- Observer, diagnostiquer et dépanner (logs, healthchecks, métriques, `strace`, `nsenter`).
- Passer à l'échelle avec Swarm et faire le pont vers Kubernetes.
- Comprendre les internals (containerd, runc, OCI, overlayfs) et préparer la certification **DCA**.

## 🗺️ Parcours

| # | Module | Niveau | Durée | Contenu |
|---|--------|--------|-------|---------|
| 00 | [Prérequis](modules/00-prerequis/) | 🟢 | 1 h | Linux, shell, réseau, git — remise à niveau |
| 01 | [Introduction aux conteneurs](modules/01-introduction/) | 🟢 | 2 h | VM vs conteneur, architecture Docker, OCI |
| 02 | [Installation & CLI](modules/02-installation-cli/) | 🟢 | 2 h | Installer Docker, premiers `docker run` |
| 03 | [Images & registres](modules/03-images-registres/) | 🟢 | 2 h | Couches, tags, digests, Docker Hub |
| 04 | [Conteneurs en profondeur](modules/04-conteneurs/) | 🟢 | 3 h | Cycle de vie, ressources, logs, restart |
| 05 | [Dockerfile](modules/05-dockerfile/) | 🟡 | 3 h | Instructions, bonnes pratiques |
| 06 | [Dockerfile avancé](modules/06-dockerfile-avance/) | 🟡 | 3 h | Multi-stage, BuildKit, cache, multi-arch |
| 07 | [Volumes & stockage](modules/07-volumes/) | 🟡 | 2 h | Volumes, bind mounts, tmpfs, sauvegardes |
| 08 | [Réseau](modules/08-reseau/) | 🟡 | 3 h | bridge, host, overlay, DNS, reverse proxy |
| 09 | [Docker Compose](modules/09-compose/) | 🟡 | 4 h | Stacks multi-services, profils, healthchecks |
| 10 | [CI/CD](modules/10-ci-cd/) | 🟠 | 3 h | GitHub Actions, GHCR, tests, déploiement |
| 11 | [Sécurité](modules/11-securite/) | 🟠 | 4 h | Hardening, scan, signature, secrets |
| 12 | [Observabilité](modules/12-observabilite/) | 🟠 | 3 h | Logs, stats, Prometheus, Grafana |
| 13 | [Orchestration](modules/13-orchestration/) | 🔴 | 4 h | Swarm, ponts vers Kubernetes |
| 14 | [Expert : internals & troubleshooting](modules/14-expert-internals/) | 🔴 | 4 h | runc, namespaces, cgroups, debug |
| 15 | [Projet final](modules/15-projet-final/) | 🔴 | 6 h | Application complète, CI, déploiement |

Total ≈ 45 h. Annexes : [aide-mémoire](annexes/cheatsheet.md) · [glossaire](annexes/glossaire.md) · [préparation DCA](annexes/preparation-dca.md) · [ressources](annexes/ressources.md).

Légende : 🟢 débutant · 🟡 intermédiaire · 🟠 avancé · 🔴 expert.

## 📁 Structure de chaque module

```
modules/NN-nom/
├── README.md   # le cours (théorie expliquée pas à pas)
├── demo.md     # démonstrations à faire en direct / à rejouer
├── lab.md      # labos pratiques (énoncé)
├── solutions.md# corrigés des labos (à consulter APRÈS avoir essayé)
├── quiz.md     # auto-évaluation (réponses en bas de page)
└── ...         # fichiers de code utilisés (Dockerfile, compose, apps)
```

> Le module 00 ne contient que le cours et son mini-test. Le module 15 (projet final) remplace `quiz.md` par un quiz de bilan et fournit une grille d'évaluation.

## 🧭 Comment suivre cette formation

**En autoformation** : lisez le `README.md` du module, rejouez le `demo.md`, faites le `lab.md` sans regarder `solutions.md`, puis passez le `quiz.md`. Ne passez au module suivant que si vous avez ≥ 80 % au quiz.

**En tant que formateur** : comptez ~40 % de théorie, 30 % de démos, 30 % de labos. Les démos sont conçues pour être jouées en direct, les labos sont progressifs et chaque énoncé précise les critères de réussite.

**Rythme conseillé (5 jours)** :

| Jour | Modules |
|------|---------|
| 1 | 00, 01, 02, 03, 04 |
| 2 | 05, 06, 07 |
| 3 | 08, 09 |
| 4 | 10, 11, 12 |
| 5 | 13, 14, 15 (projet) |

## 🛠️ Prérequis matériel & logiciel

- Un poste Linux, macOS ou Windows (WSL2) avec 8 Go de RAM et 20 Go de disque libre.
- Docker Engine ≥ 24 (ou Docker Desktop) avec le plugin Compose v2 — voir [module 02](modules/02-installation-cli/).
- Git, un éditeur (VS Code recommandé) et un compte [Docker Hub](https://hub.docker.com) + GitHub.
- Alternative sans installation : [Play with Docker](https://labs.play-with-docker.com) ou un Codespace GitHub.

## ✅ Vérifier son environnement

```bash
./scripts/check-env.sh
```

## 🤝 Contribuer

Les issues et PR sont bienvenues (coquilles, améliorations, nouveaux labos). Licence : MIT.
