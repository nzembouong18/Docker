# Labos — Module 01

## Lab 1.1 — Observer l'isolation (20 min)

**Objectif** : prouver qu'un conteneur est un processus isolé.

1. Lancez `docker run -d --name lab11 nginx:alpine`.
2. Trouvez le PID du processus nginx **sur l'hôte** (`docker inspect -f '{{.State.Pid}}' lab11`).
3. Listez ses namespaces : `sudo ls -l /proc/<PID>/ns`.
4. Comparez avec ceux de votre shell : `ls -l /proc/$$/ns`. Quels namespaces diffèrent ?
5. Lancez `docker exec lab11 hostname` et `hostname` : que constatez-vous ?

**Critère de réussite** : vous expliquez à voix haute pourquoi les identifiants de namespaces `pid`, `net`, `mnt`, `uts` diffèrent.

## Lab 1.2 — Limiter les ressources (15 min)

1. Lancez un conteneur Alpine limité à 0,5 CPU et 64 Mo : `docker run --rm -it --cpus 0.5 -m 64m alpine sh`.
2. Dans le conteneur, lancez une boucle CPU : `while :; do :; done &` (deux fois).
3. Depuis un autre terminal : `docker stats --no-stream`. Quelle consommation CPU observez-vous ?
4. Vérifiez la valeur dans les cgroups : `cat /sys/fs/cgroup/cpu.max`.

## Lab 1.3 — Schéma d'architecture (15 min)

Sans notes, dessinez le chemin complet d'un `docker run -p 8080:80 nginx` (CLI → dockerd → containerd → runc → processus, registry, réseau). Comparez avec le schéma du cours.

## Lab 1.4 — VM ou conteneur ? (10 min)

Pour chaque cas, choisissez et justifiez :
1. Héberger 50 petites APIs Node.js.
2. Exécuter un OS Windows de test.
3. Isoler du code non fiable soumis par des utilisateurs externes.
4. Environnement de dev reproductible pour 20 développeurs.

> Corrigés : [solutions.md](solutions.md)
