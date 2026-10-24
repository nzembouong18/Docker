# Labos — Module 13

## Lab 13.1 — Cluster Swarm et haute disponibilité (45 min)
Sur Play-with-Docker : 3 managers + 2 workers.
1. Initialisez, joignez, vérifiez `docker node ls`.
2. Déployez un service à 6 réplicas ; montrez la répartition par nœud.
3. Arrêtez (ou `docker swarm leave --force`) un worker : que deviennent ses tâches ?
4. Faites tomber un manager puis deux : à partir de quand le cluster perd-il le quorum ?

## Lab 13.2 — Déployer la stack du module 09 sur Swarm (60 min)
Adaptez `modules/09-compose/stack/compose.yaml` en stack Swarm :
- images poussées dans un registre accessible à tous les nœuds (registre local `registry:2` ou GHCR),
- secrets Swarm (`external: true`) au lieu des fichiers,
- Postgres contraint à un nœud (`placement.constraints`) avec volume,
- web à 3 réplicas avec mise à jour `start-first`.
Testez une mise à jour sans interruption (boucle `curl` pendant `docker service update`).

## Lab 13.3 — Même appli, Kubernetes (60 min)
Avec `kind`/`minikube` : écrivez Deployment + Service + Ingress + Secret + PVC pour la stack. Comparez le nombre de lignes, les concepts supplémentaires, et ce que Kubernetes apporte (probes distinctes, HPA, RBAC…).

## Lab 13.4 — Autoscaling (30 min, Kubernetes)
Installez metrics-server, créez un `HorizontalPodAutoscaler` (CPU 50 %, 2-8 réplicas) sur un Deployment, générez de la charge (`kubectl run -it load --image=busybox -- sh -c 'while :; do wget -q -O- http://web; done'`) et observez la montée puis la descente.

## Lab 13.5 — Choisir la bonne plateforme (20 min, discussion)
Pour trois scénarios (startup 2 devs / PME avec 15 services / grande entreprise multi-équipes), justifiez : Compose sur VM, Swarm, Kubernetes managé, Cloud Run.

> Corrigés : [solutions.md](solutions.md)
