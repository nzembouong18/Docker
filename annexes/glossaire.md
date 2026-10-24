# Glossaire

| Terme | Définition |
|-------|-----------|
| **Image** | Modèle immuable en couches + métadonnées servant à créer des conteneurs. |
| **Conteneur** | Processus isolé (namespaces) et limité (cgroups) lancé depuis une image. |
| **Couche (layer)** | Différence de système de fichiers produite par une instruction de build. |
| **Registry / registre** | Serveur de stockage et distribution d'images (Docker Hub, GHCR, ECR…). |
| **Repository** | Collection d'images de même nom, distinguées par des tags. |
| **Tag** | Étiquette mutable d'une version d'image. |
| **Digest** | Empreinte sha256 immuable d'un manifest d'image. |
| **Manifest (list)** | Description d'une image (et de ses variantes d'architecture). |
| **Dockerfile** | Recette textuelle de construction d'une image. |
| **Contexte de build** | Ensemble de fichiers envoyés au builder. |
| **BuildKit** | Moteur de build moderne (cache, parallélisme, mounts, secrets). |
| **Multi-stage** | Dockerfile à plusieurs `FROM` pour séparer build et runtime. |
| **Volume** | Stockage persistant géré par Docker. |
| **Bind mount** | Montage d'un chemin de l'hôte dans le conteneur. |
| **tmpfs** | Montage en mémoire vive. |
| **Namespace** | Mécanisme du noyau isolant une ressource (pid, net, mnt…). |
| **cgroup** | Mécanisme du noyau limitant/comptabilisant les ressources. |
| **OverlayFS** | Système de fichiers union empilant des couches. |
| **Capability** | Fraction des privilèges root du noyau. |
| **seccomp** | Filtre des appels système. |
| **AppArmor / SELinux** | Contrôle d'accès obligatoire (MAC). |
| **Rootless** | Exécution du démon et des conteneurs sans privilèges root. |
| **runc** | Runtime OCI bas niveau qui crée le conteneur. |
| **containerd** | Runtime haut niveau (images, snapshots, tâches). |
| **OCI** | Open Container Initiative : standards image/runtime/distribution. |
| **Compose** | Outil de description et d'exécution d'applications multi-conteneurs. |
| **Stack / Service / Tâche** | (Swarm) ensemble de services / définition répliquée / instance. |
| **Overlay (réseau)** | Réseau virtuel multi-hôtes (VXLAN). |
| **Healthcheck** | Commande testant périodiquement la santé d'un conteneur. |
| **PID 1** | Premier processus du conteneur ; reçoit les signaux, doit récolter les zombies. |
| **SBOM** | Inventaire des composants d'une image. |
| **Provenance (SLSA)** | Preuve de la manière dont un artefact a été construit. |
| **cosign / Sigstore** | Outils de signature et de vérification d'artefacts. |
| **Pod** | (Kubernetes) plus petite unité déployable, un ou plusieurs conteneurs. |
| **Orchestrateur** | Système maintenant l'état désiré d'un parc de conteneurs. |
| **12 facteurs** | Principes de conception d'applications cloud-native. |
