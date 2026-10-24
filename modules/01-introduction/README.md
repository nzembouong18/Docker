# Module 01 — Introduction aux conteneurs et à Docker

> **Durée** : 2 h · **Niveau** : 🟢 · **Objectif** : comprendre *pourquoi* et *comment* les conteneurs fonctionnent avant de taper la moindre commande.

## 1. Le problème que Docker résout

> « Ça marche sur ma machine ! »

Une application dépend de : un OS, un runtime (Python 3.12, Node 22…), des bibliothèques, des variables d'environnement, des fichiers de configuration. Quand ces éléments diffèrent entre le poste du développeur, la CI, la préproduction et la production, les bugs apparaissent.

**Idée clé** : empaqueter l'application **avec toutes ses dépendances** dans une unité standard, portable et reproductible → le **conteneur**.

## 2. Machine virtuelle vs conteneur

```
   MACHINE VIRTUELLE                       CONTENEURS
┌────────┬────────┬────────┐        ┌────────┬────────┬────────┐
│ App A  │ App B  │ App C  │        │ App A  │ App B  │ App C  │
│ Libs   │ Libs   │ Libs   │        │ Libs   │ Libs   │ Libs   │
│ OS inv.│ OS inv.│ OS inv.│        └────────┴────────┴────────┘
├────────┴────────┴────────┤        ┌──────────────────────────┐
│       Hyperviseur        │        │      Docker Engine       │
├──────────────────────────┤        ├──────────────────────────┤
│        OS hôte           │        │   OS hôte (noyau partagé)│
├──────────────────────────┤        ├──────────────────────────┤
│        Matériel          │        │        Matériel          │
└──────────────────────────┘        └──────────────────────────┘
```

| Critère | VM | Conteneur |
|---------|----|-----------|
| Isolation | Forte (noyau dédié) | Plus faible (**noyau partagé**) |
| Taille | Go | Mo |
| Démarrage | Minutes | Secondes / ms |
| Densité | Dizaines par hôte | Centaines |
| Cas d'usage | Isolation forte, OS différents | Microservices, CI, apps cloud-native |

⚠️ Un conteneur **n'est pas une VM** : c'est un **processus Linux isolé**. Il partage le noyau de l'hôte. Un conteneur Linux ne peut pas faire tourner un noyau Windows (sur Mac/Windows, Docker Desktop lance une petite VM Linux).

## 3. Comment ça marche : 3 briques du noyau Linux

Un conteneur = un processus + ces mécanismes :

1. **Namespaces** → *ce que le processus voit* (isolation). Types : `pid` (ses propres PID), `net` (sa pile réseau), `mnt` (ses montages), `uts` (hostname), `ipc`, `user`, `cgroup`.
2. **cgroups** (control groups) → *ce que le processus peut consommer* (CPU, mémoire, I/O, nombre de processus).
3. **Union filesystem** (OverlayFS) → *ses fichiers* : des couches en lecture seule empilées + une couche inscriptible.

À cela s'ajoutent les **capabilities**, **seccomp** et **AppArmor/SELinux** pour restreindre les privilèges (module 11).

> 🔬 Vous verrez ces mécanismes à l'œuvre en démo (`demo.md`) et en détail au module 14.

## 4. Architecture de Docker

```
 ┌────────────┐  REST API   ┌──────────────┐   ┌────────────┐   ┌──────┐
 │ docker CLI │───────────▶│  dockerd     │──▶│ containerd │──▶│ runc │──▶ processus
 └────────────┘ (socket)    │ (Docker Eng.)│   └────────────┘   └──────┘   conteneur
                            └──────┬───────┘
                                   │ pull / push
                            ┌──────▼───────┐
                            │   Registry   │ (Docker Hub, GHCR, ECR…)
                            └──────────────┘
```

- **Client (`docker`)** : la ligne de commande. Parle à l'API du démon.
- **Démon (`dockerd`)** : gère images, conteneurs, réseaux, volumes. Écoute sur `/var/run/docker.sock`.
- **containerd** : runtime de haut niveau (cycle de vie, images, snapshots).
- **runc** : runtime bas niveau OCI, crée réellement le conteneur (namespaces + cgroups).
- **Registry** : stockage et distribution des images.

## 5. Vocabulaire fondamental

| Terme | Définition simple |
|-------|-------------------|
| **Image** | Modèle en lecture seule : système de fichiers + métadonnées (commande, ports…). Comme une « classe ». |
| **Conteneur** | Instance en exécution d'une image. Comme un « objet ». |
| **Dockerfile** | Recette textuelle pour construire une image. |
| **Registry** | Serveur qui stocke des images (Docker Hub…). |
| **Repository** | Ensemble d'images portant le même nom (`nginx`) avec plusieurs **tags** (`1.27`, `latest`). |
| **Volume** | Stockage persistant géré par Docker. |
| **Réseau** | Réseau virtuel reliant des conteneurs. |
| **Compose** | Outil pour décrire/lancer une application multi-conteneurs en YAML. |

## 6. Standards : OCI

L'**Open Container Initiative** définit :
- *Image spec* : format d'une image,
- *Runtime spec* : comment exécuter un conteneur,
- *Distribution spec* : comment échanger des images.

Conséquence : une image Docker fonctionne avec Podman, containerd, CRI-O, Kubernetes… Docker n'est plus la seule option mais reste la référence pédagogique et de développement.

## 7. Cycle de vie global

```
Dockerfile ──build──▶ Image ──push──▶ Registry ──pull──▶ Image ──run──▶ Conteneur
```

*Build once, run anywhere.*

## 8. Quand utiliser (ou pas) les conteneurs

✅ Microservices, APIs, workers, environnements de dev reproductibles, CI/CD, tests d'intégration, bases de données de dev.
⚠️ À réfléchir : bases de données de production critiques (possible, mais gérez le stockage), applications avec GUI lourde, charges nécessitant un noyau spécifique, besoins d'isolation forte multi-tenant (préférez VM/gVisor/Kata).

## 9. À retenir

- Conteneur = **processus isolé** (namespaces) et **limité** (cgroups), avec un FS en couches.
- Image = modèle immuable ; conteneur = instance éphémère.
- Le noyau est **partagé** avec l'hôte.
- Docker = CLI + dockerd + containerd + runc, standard OCI.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 02](../02-installation-cli/)
