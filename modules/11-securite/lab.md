# Labos — Module 11

## Lab 11.1 — Audit d'un conteneur dangereux (30 min)
Voici une commande de lancement :
```bash
docker run -d --name vuln --privileged --network host -v /var/run/docker.sock:/var/run/docker.sock \
  -v /:/host -e DB_PASSWORD=admin123 -u root nginx:latest
```
1. Listez **tous** les problèmes de sécurité.
2. Démontrez-en deux (ex. lire `/etc/shadow` de l'hôte depuis le conteneur, créer un conteneur frère).
3. Réécrivez la commande de façon sûre (nginx doit toujours servir sur le port 8080 de l'hôte).

## Lab 11.2 — Durcir une application (45 min)
Prenez l'API Flask du module 05. Obtenez : utilisateur non-root, FS en lecture seule (+ tmpfs), `cap_drop: ALL`, `no-new-privileges`, limites de ressources, healthcheck, base épinglée par digest. Prouvez chaque propriété par une commande.

## Lab 11.3 — Scan et remédiation (40 min)
1. Construisez une image basée sur `python:3.9` + `flask==1.0` ; scannez avec Trivy et Docker Scout.
2. Réduisez les CVE CRITICAL/HIGH à zéro corrigeable en mettant à jour base et dépendances.
3. Comparez le nombre de CVE avec une variante `slim`, `alpine` et `distroless`.
4. Générez le SBOM (`syft`) et cherchez-y `openssl`.

## Lab 11.4 — Chasse aux secrets (30 min)
1. Construisez volontairement une image qui contient un secret (`ARG`, `ENV`, fichier copié puis supprimé).
2. Retrouvez-le avec `docker history`, `docker inspect`, `docker save | tar` (analysez les couches) et `trivy image --scanners secret`.
3. Corrigez avec `--mount=type=secret` et prouvez que l'image est propre.

## Lab 11.5 — Rootless (30 min)
Installez Docker en mode rootless (ou lancez `docker run docker:dind-rootless`), lancez un conteneur root et montrez à quel utilisateur il correspond sur l'hôte (`ps -o user= -p <pid>`). Notez les limitations (ports < 1024, certains pilotes réseau/stockage).

## Lab 11.6 — Détection runtime (optionnel, 30 min)
Déployez Falco (ou observez `docker events`/`auditd`), ouvrez un shell dans un conteneur et modifiez `/etc/passwd` ; retrouvez l'alerte correspondante.

> Corrigés : [solutions.md](solutions.md)
