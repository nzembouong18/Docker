# Quiz — Module 12

1. Quels sont les trois piliers de l'observabilité ?
2. Un conteneur `unhealthy` est-il redémarré automatiquement par Docker seul ?
3. Pourquoi `json-file` peut-il remplir un disque ?
4. Quel composant expose les métriques par conteneur ?
5. Différence liveness / readiness ?
6. À quoi sert `start_period` ?
7. Que mesurent les méthodes RED et USE ?
8. Quel événement Docker signale un dépassement mémoire ?

<details><summary>Réponses</summary>

1. Logs, métriques, traces. — 2. Non (c'est Swarm/Kubernetes ou un outil comme autoheal). — 3. Pas de rotation par défaut. — 4. cAdvisor (via les cgroups). — 5. Liveness : le processus fonctionne ; readiness : il est prêt à recevoir du trafic. — 6. Délai de grâce où les échecs ne comptent pas encore. — 7. RED : Rate/Errors/Duration (services) ; USE : Utilization/Saturation/Errors (ressources). — 8. `oom`.
</details>
