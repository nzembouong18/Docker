# Solutions — Module 13

## Lab 13.1
3. Les tâches du worker perdu sont **replanifiées** sur les autres nœuds après détection de la panne.
4. Quorum Raft : avec 3 managers il faut 2 vivants. Après la perte d'un manager, le cluster fonctionne ; après la perte de deux, il n'y a plus de quorum : les services en cours continuent de tourner mais **plus aucune modification** (scale, update) n'est possible tant que le quorum n'est pas rétabli.

## Lab 13.2
Points d'attention :
```yaml
services:
  db:
    deploy:
      placement: { constraints: ["node.labels.db == true"] }
secrets:
  db_password: { external: true }
```
```bash
docker node update --label-add db=true node1
docker build -t registry.exemple/web:1 web && docker push registry.exemple/web:1
```
`build:` n'est pas supporté par `docker stack deploy` (images pré-construites obligatoires), `depends_on` et `container_name` sont ignorés : prévoir retry applicatif. Volume local = donnée liée à un nœud (d'où la contrainte).

## Lab 13.3
Mapping : Deployment (web), StatefulSet ou Deployment+PVC (Postgres), Service ClusterIP (db, redis, web), Ingress (proxy), Secret (mot de passe), ConfigMap (nginx.conf), PVC (pgdata), probes (readiness sur `/ready`).

## Lab 13.4
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: web }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: web }
  minReplicas: 2
  maxReplicas: 8
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 50 } }
```
Le Deployment doit définir `resources.requests.cpu`, sinon l'HPA ne calcule rien. Descente progressive (fenêtre de stabilisation 5 min).

## Lab 13.5
Éléments de réponse : startup → Compose sur VM ou Cloud Run/Fly.io ; PME 15 services → Kubernetes managé (ou ECS Fargate si cloud unique) ; grande entreprise → Kubernetes managé + plateforme interne (GitOps, politique, observabilité). Swarm : équipes petites avec parc Docker existant, besoins simples, en connaissance du risque de pérennité.
