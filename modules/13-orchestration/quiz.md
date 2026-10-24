# Quiz — Module 13

1. Qu'est-ce qu'un « état désiré » ?
2. Différence service / tâche dans Swarm ?
3. Combien de managers pour tolérer 2 pannes ?
4. Que fait `update_config.order: start-first` ?
5. Quel objet Kubernetes correspond le mieux à un service Swarm répliqué ?
6. Pourquoi `docker stack deploy` n'accepte-t-il pas `build:` ?
7. Kubernetes exécute-t-il vos images Docker ?
8. Pourquoi un conteneur doit-il être sans état pour être orchestré ?

<details><summary>Réponses</summary>

1. La description de ce qu'on veut (images, réplicas…) que l'orchestrateur maintient en continu. — 2. Le service est la définition ; la tâche est une instance planifiée sur un nœud. — 3. 5 (quorum 3 sur 5). — 4. Démarre le nouveau conteneur avant d'arrêter l'ancien. — 5. Deployment (+ Service). — 6. Les nœuds doivent tirer des images déjà construites depuis un registre. — 7. Oui, ce sont des images OCI. — 8. Pour pouvoir le tuer, le déplacer ou le multiplier sans perdre de données.
</details>
