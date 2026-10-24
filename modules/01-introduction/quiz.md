# Quiz — Module 01

1. Un conteneur partage-t-il le noyau de l'hôte ?
   - a) Non, il embarque son noyau  b) Oui  c) Seulement sous Windows
2. Quel mécanisme limite la mémoire utilisable ?
   - a) namespaces  b) cgroups  c) seccomp
3. Quel mécanisme isole les PID visibles ?
   - a) namespaces  b) cgroups  c) overlayfs
4. Quelle est la différence image/conteneur ?
5. Quel composant crée réellement le conteneur ?
   - a) docker CLI  b) dockerd  c) runc
6. Que signifie OCI ?
7. Pourquoi donner accès à `/var/run/docker.sock` est dangereux ?
8. Citez deux avantages des conteneurs sur les VM.

<details><summary>Réponses</summary>

1. b — 2. b — 3. a — 4. L'image est un modèle immuable ; le conteneur est une instance en exécution avec une couche inscriptible. — 5. c — 6. Open Container Initiative (standards image/runtime/distribution). — 7. Le démon tourne en root : qui parle à son API peut monter `/` de l'hôte dans un conteneur ⇒ root sur l'hôte. — 8. Légèreté, démarrage rapide, densité, portabilité.
</details>
