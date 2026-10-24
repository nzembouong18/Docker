# Démos — Module 13

> Pour le multi-nœuds : <https://labs.play-with-docker.com> (5 instances gratuites) ou 3 VM. Un seul nœud suffit pour la plupart des démos.

## Démo 1 — Cluster Swarm (5 min)
```bash
docker swarm init
docker node ls
docker swarm join-token worker       # (workers: coller la commande sur les autres nœuds)
```

## Démo 2 — Service, scale, auto-guérison (10 min)
```bash
docker service create --name web --replicas 3 -p 8080:80 nginx:1.27-alpine
docker service ps web
curl -s localhost:8080 | head -3
docker rm -f $(docker ps -q --filter name=web.1)           # on tue une tâche
docker service ps web                                       # recréée automatiquement
docker service scale web=6 && docker service ls
```

## Démo 3 — Mise à jour progressive et rollback (10 min)
```bash
docker service update --image nginx:1.27.2-alpine --update-parallelism 1 --update-delay 5s web
watch docker service ps web
docker service update --image nginx:image-inexistante web     # échec
docker service rollback web
```

## Démo 4 — Stack complète (10 min)
```bash
cd swarm
echo -n "s3cret" | docker secret create api_key -
docker stack deploy -c stack.yaml demo
docker stack services demo ; docker stack ps demo
curl localhost:8080
docker stack rm demo ; docker secret rm api_key
```

## Démo 5 — Maintenance d'un nœud (3 min, multi-nœuds)
```bash
docker node update --availability drain worker1
docker service ps web          # tâches déplacées
docker node update --availability active worker1
```

## Démo 6 — Même application sur Kubernetes (15 min)
```bash
kind create cluster --name demo
kubectl apply -f k8s/deployment.yaml
kubectl get pods -w
kubectl port-forward svc/web 8080:80 &
curl -sI localhost:8080 | head -1
kubectl delete pod -l app=web --wait=false && kubectl get pods         # recréés
kubectl scale deploy/web --replicas=5
kubectl rollout restart deploy/web && kubectl rollout status deploy/web
kind delete cluster --name demo
```

## Démo 7 — Compose → Kubernetes avec kompose (5 min)
```bash
cd ../../09-compose/stack
kompose convert -f compose.yaml -o /tmp/k8s-gen && ls /tmp/k8s-gen
```
Discutez de ce qu'il faut corriger (secrets, probes, ressources, stockage).
