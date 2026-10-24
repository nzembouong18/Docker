# Quiz final — Module 15 (bilan de formation)

1. Pourquoi les tests sont-ils exécutés dans une étape de build dédiée ?
2. Pourquoi le réseau `back` est-il `internal` ?
3. Quel est l'intérêt de `up -d --wait` dans une CI ?
4. Pourquoi `read_only: true` demande-t-il des `tmpfs` pour nginx ?
5. Comment prouver qu'une image ne contient pas de secret ?
6. Quelle différence entre `/live` et `/ready` ?
7. Citez trois mécanismes qui limitent l'impact d'une compromission du conteneur `api`.
8. Comment revenir en arrière après un mauvais déploiement ?
9. Quelles informations place-t-on dans les labels OCI ?
10. Que changeriez-vous pour passer cette stack sur plusieurs hôtes ?

<details><summary>Réponses</summary>

1. Une image dont les tests échouent n'est jamais produite ; les tests utilisent exactement les dépendances de l'image. — 2. Pour que la base n'ait ni accès Internet ni exposition vers l'extérieur et qu'elle ne soit joignable que par l'API. — 3. Attendre les healthchecks avant les tests ⇒ pas de faux négatifs. — 4. nginx écrit des caches et son PID à l'exécution. — 5. `trivy image --scanners secret`, `docker history`, inspection des couches ; construire avec `--mount=type=secret`. — 6. `/live` : le processus répond ; `/ready` : les dépendances (DB) sont utilisables. — 7. Non-root, `cap_drop: ALL`, `no-new-privileges`, FS RO, réseau isolé, limites de ressources. — 8. Redéployer le tag/digest précédent (variable `TAG`) puis vérifier les healthchecks. — 9. Version, révision (SHA), source du dépôt, titre, licence. — 10. Registre partagé, secrets du cluster, volumes réseau ou base managée, orchestrateur (Swarm/Kubernetes), ingress/load balancer.
</details>
