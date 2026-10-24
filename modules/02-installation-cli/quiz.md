# Quiz — Module 02

1. Quelle commande vérifie que client ET serveur répondent ?
2. Que fait `docker run -d -p 8080:80 nginx` ?
3. Différence entre `docker stop` et `docker kill` ?
4. Que signifie le code de sortie 137 ?
5. Comment exécuter un shell dans un conteneur déjà lancé ?
6. À quoi sert `--rm` ?
7. Pourquoi éviter le tag `latest` ?
8. Quelle commande affiche l'occupation disque de Docker ?

<details><summary>Réponses</summary>

1. `docker version` — 2. Lance nginx en arrière-plan et publie le port 80 du conteneur sur le 8080 de l'hôte — 3. `stop` envoie SIGTERM puis SIGKILL après un délai ; `kill` envoie directement SIGKILL (ou le signal choisi) — 4. 128+9 : tué par SIGKILL (souvent OOM ou `docker kill`) — 5. `docker exec -it NOM sh` — 6. Supprime le conteneur à son arrêt — 7. Non reproductible : le contenu change dans le temps — 8. `docker system df`
</details>
