# Module 13 — Orchestration : Docker Swarm et passage à Kubernetes

> **Durée** : 4 h · **Niveau** : 🔴 · Fichiers : [`swarm/`](swarm/), [`k8s/`](k8s/).

## 1. Pourquoi orchestrer ?

Compose gère bien **un hôte**. En production on veut :
- **plusieurs machines** (capacité, tolérance aux pannes),
- **auto-guérison** (redémarrer/replanifier les conteneurs défaillants),
- **mise à l'échelle** et répartition de charge,
- **mises à jour progressives** et rollback,
- **découverte de services**, secrets, configuration centralisés.

Un orchestrateur transforme un **état désiré** (« 3 réplicas de web ») en actions, en boucle de réconciliation permanente.

## 2. Docker Swarm

Mode cluster intégré à Docker Engine : simple à mettre en place, même format que Compose (`stack`).

### Architecture
```
 Managers (Raft, 3 ou 5)        Workers
 ┌────┐ ┌────┐ ┌────┐          ┌────┐ ┌────┐ ┌────┐
 │ M1 │ │ M2 │ │ M3 │ ◀──────▶ │ W1 │ │ W2 │ │ W3 │
 └────┘ └────┘ └────┘          └────┘ └────┘ └────┘
   état du cluster (Raft)        exécutent les tâches (conteneurs)
```
- **Node** : machine du cluster (manager ou worker).
- **Service** : état désiré (image, réplicas, ports…).
- **Task** : une instance (conteneur) planifiée sur un nœud.
- **Stack** : ensemble de services (fichier compose).
- Réseaux **overlay** (VXLAN), **routing mesh** (un port publié répond sur tous les nœuds), **secrets** et **configs** chiffrés.
- Ports à ouvrir : 2377/tcp (gestion), 7946/tcp+udp (gossip), 4789/udp (VXLAN).

### Mise en route (labo avec 1 nœud ou 3 VM / Play-with-Docker)
```bash
docker swarm init --advertise-addr <IP>             # sur le 1er manager
docker swarm join-token worker                       # affiche la commande join
docker node ls
```

### Services
```bash
docker service create --name web --replicas 3 -p 8080:80 nginx:1.27-alpine
docker service ls ; docker service ps web
docker service scale web=5
docker service update --image nginx:1.27.2-alpine --update-parallelism 1 --update-delay 10s web
docker service rollback web
docker service logs -f web
docker service inspect --pretty web
docker node update --availability drain w1          # vider un nœud pour maintenance
```

### Stacks
```bash
echo -n "s3cret" | docker secret create api_key -
docker stack deploy -c swarm/stack.yaml demo
docker stack services demo ; docker stack ps demo
docker stack rm demo
```
Voir [`swarm/stack.yaml`](swarm/stack.yaml) : réplicas, mise à jour `start-first` avec rollback automatique, limites, placement, healthcheck, configs, secrets, réseaux overlay (un `internal`).

### Auto-guérison et mises à jour
- Un conteneur qui tombe ou `unhealthy` est **replanifié**.
- Un nœud perdu → ses tâches sont recréées ailleurs.
- `update_config.order: start-first` → zéro interruption si le healthcheck est bon.

### Haute disponibilité
3 managers tolèrent 1 panne, 5 en tolèrent 2 (quorum Raft : `(N/2)+1`). Sauvegardez `/var/lib/docker/swarm`.

### Limites de Swarm
Écosystème plus restreint, moins d'extensions (opérateurs, CRD), adoption en baisse face à Kubernetes. Pertinent pour des équipes petites, des besoins simples, un parc Docker existant.

## 3. Kubernetes : le standard

### Correspondance de vocabulaire

| Docker / Swarm | Kubernetes |
|----------------|-----------|
| Conteneur | Container dans un **Pod** (unité minimale, 1+ conteneurs partageant réseau/volumes) |
| Service Swarm (replicas) | **Deployment** (+ ReplicaSet) |
| `-p` / routing mesh | **Service** (ClusterIP/NodePort/LoadBalancer) + **Ingress/Gateway** |
| Volume | **PersistentVolumeClaim** / PV / StorageClass |
| Secrets / configs | **Secret** / **ConfigMap** |
| `--restart` | `restartPolicy` + contrôleurs |
| Healthcheck | **liveness / readiness / startup probes** |
| Réseau overlay | CNI (Calico, Cilium, Flannel) |
| `stack` | Helm chart / Kustomize |
| Nœud | Node (kubelet + container runtime : containerd/CRI-O) |

Kubernetes n'utilise plus Docker Engine comme runtime (retrait de dockershim en 1.24) mais **vos images Docker/OCI fonctionnent telles quelles**.

### Premier déploiement (kind / minikube / k3d / Docker Desktop)
```bash
kind create cluster                          # cluster local dans Docker
kubectl apply -f k8s/deployment.yaml
kubectl get pods,svc -o wide
kubectl port-forward svc/web 8080:80         # http://localhost:8080
kubectl scale deploy/web --replicas=5
kubectl set image deploy/web web=nginxinc/nginx-unprivileged:1.27.2-alpine
kubectl rollout status deploy/web ; kubectl rollout undo deploy/web
kubectl logs -l app=web --tail=20 ; kubectl describe pod <pod> ; kubectl exec -it <pod> -- sh
kubectl delete -f k8s/deployment.yaml
```
Voir [`k8s/deployment.yaml`](k8s/deployment.yaml) : l'équivalent durci (non-root, FS RO, caps drop, probes, resources).

### Convertir Compose → Kubernetes
Outil `kompose convert -f compose.yaml` (point de départ, à retravailler), ou Docker Desktop « Deploy to Kubernetes ». Pour une stack classique : Deployment + Service + Ingress + PVC + Secret/ConfigMap.

## 4. Autres cibles de production pour des conteneurs

| Option | Quand |
|--------|-------|
| Compose sur 1 VM | petit projet, SLA modeste |
| Swarm | quelques nœuds, simplicité |
| Kubernetes managé (EKS, GKE, AKS, OKE, Scaleway…) | standard industriel |
| Nomad (HashiCorp) | orchestration simple, multi-workloads |
| Serverless conteneurs (Cloud Run, ECS Fargate, ACA) | pas de gestion de cluster |
| PaaS (Fly.io, Render, Railway) | simplicité maximale |

## 5. Principes « cloud-native » à appliquer dès Docker

1. **Conteneurs sans état** : état dans des services externes (DB, objet, cache).
2. **Config par l'environnement**, secrets externes.
3. **Logs sur stdout**, métriques exposées.
4. **Démarrage rapide, arrêt propre** (SIGTERM).
5. **Healthchecks** précis.
6. **Idempotence** et tolérance aux pannes (retries, timeouts, circuit breakers).
7. **Une image, plusieurs environnements.**

(Les « 12 facteurs » : https://12factor.net/fr/)

## 6. À retenir

- Orchestrateur = état désiré + réconciliation.
- Swarm : simple, Compose-like. Kubernetes : standard, riche, plus complexe.
- Vos images OCI se déplacent librement ; ce sont les **manifestes** qui changent.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 14](../14-expert-internals/)
