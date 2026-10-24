# Labos — Module 03

## Lab 3.1 — Comparer des images de base (20 min)
1. Téléchargez `python:3.12`, `python:3.12-slim`, `python:3.12-alpine`.
2. Dressez un tableau : taille, nombre de couches, OS (`cat /etc/os-release` via `docker run --rm`), libc (`ldd --version` ou `apk info musl`).
3. Quelle variante choisiriez-vous pour une app Python avec des dépendances compilées (numpy, pandas) ? Pourquoi ?

## Lab 3.2 — Détective d'images (15 min)
Pour `nginx:1.27-alpine`, retrouvez **sans lancer de conteneur** : la commande par défaut (CMD), les ports exposés, l'utilisateur par défaut, la date de création, l'architecture.

## Lab 3.3 — Publier sur Docker Hub (20 min)
1. Créez un compte Docker Hub et un *access token*.
2. `docker login`, taguez `alpine:3.20` en `<votre-user>/alpine-formation:1.0`, poussez-la.
3. Supprimez-la en local, puis retirez-la depuis Docker Hub (`docker pull`).
4. Vérifiez sur hub.docker.com que le dépôt existe.

## Lab 3.4 — Registre privé (25 min)
1. Démarrez `registry:2` avec un **volume nommé** pour persister (`-v registry-data:/var/lib/registry`).
2. Poussez 2 images différentes sous deux tags.
3. Listez le catalogue et les tags via l'API HTTP.
4. Redémarrez le registre : les images sont-elles toujours là ?
5. *Bonus* : supprimez une image via l'API (le *garbage collector* est nécessaire : `registry garbage-collect`).

## Lab 3.5 — Reproductibilité (15 min)
Récupérez le digest de `alpine:3.20`, lancez un conteneur par digest, et expliquez pourquoi `FROM alpine:3.20@sha256:…` est plus sûr qu'un tag seul.

> Corrigés : [solutions.md](solutions.md)
