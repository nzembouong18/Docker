# Quiz — Module 09

1. `docker compose` ou `docker-compose` ? Que signifie le champ `version:` aujourd'hui ?
2. Comment un service `web` joint-il `db` ?
3. `depends_on` garantit-il que la base est prête ? Sinon, que faire ?
4. Différence entre `.env`, `env_file` et `environment` ?
5. Quelle commande supprime aussi les volumes ?
6. À quoi servent les profils ?
7. Pourquoi éviter `container_name` ?
8. Quelle commande affiche la configuration finale interpolée ?
9. Comment attendre que tous les services soient healthy ?

<details><summary>Réponses</summary>

1. `docker compose` (v2, plugin). `version:` est obsolète/ignoré. — 2. Par le nom du service (`db`) sur le réseau du projet. — 3. Non (seulement l'ordre) ; utiliser `healthcheck` + `condition: service_healthy` + retry applicatif. — 4. `.env` : interpolation du fichier compose ; `env_file` : fichier injecté dans le conteneur ; `environment` : variables explicites du conteneur. — 5. `docker compose down -v`. — 6. Activer des services optionnels (debug, monitoring) à la demande. — 7. Il empêche le scale et crée des conflits entre projets. — 8. `docker compose config`. — 9. `docker compose up -d --wait`.
</details>
