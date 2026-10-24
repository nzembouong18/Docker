# Module 12 — Observabilité : logs, métriques, santé

> **Durée** : 3 h · **Niveau** : 🟠 · Stack d'exemple : [`monitoring/`](monitoring/).

## 1. Les trois piliers

| Pilier | Question | Outils |
|--------|----------|--------|
| **Logs** | *Que s'est-il passé ?* | `docker logs`, Loki, ELK/EFK, Fluentd |
| **Métriques** | *Quel est l'état/la charge ?* | `docker stats`, cAdvisor, Prometheus, Grafana |
| **Traces** | *Où le temps est-il perdu entre services ?* | OpenTelemetry, Jaeger, Tempo |

+ **Healthchecks** et **événements** pour l'état et le cycle de vie.

## 2. Outils natifs

```bash
docker ps / docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker stats [--no-stream] [--format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}']
docker top nom
docker logs -f --tail 100 --since 10m nom
docker events --filter type=container --filter event=die
docker inspect nom
docker system df -v
```

`docker events` : flux temps réel (create, start, die, oom, health_status…) — base d'automatisations.

## 3. Healthchecks

Un conteneur « running » n'est pas forcément « en bonne santé ». Le healthcheck exécute périodiquement une commande ; code 0 = sain.

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:8080/health || exit 1
```
```yaml
healthcheck:
  test: ["CMD", "curl", "-fsS", "http://localhost:8080/health"]
  interval: 30s
  timeout: 3s
  start_period: 20s
  retries: 3
```

États : `starting` → `healthy` / `unhealthy`. Points clés :
- `start_period` : délai de grâce au démarrage.
- Docker **ne redémarre pas** un conteneur `unhealthy` (Swarm et Kubernetes le font ; sous Compose utilisez `autoheal` ou un superviseur).
- Un bon `/health` vérifie les dépendances **critiques** mais reste rapide ; distinguez *liveness* (le processus vit) et *readiness* (prêt à servir).
- Images minimales sans `curl` : utilisez `wget`, un binaire de l'appli (`app healthcheck`) ou un petit script.

Lecture : `docker inspect -f '{{json .State.Health}}' nom | jq`.

## 4. Logs en profondeur

### 4.1 Drivers de logs

| Driver | Remarque |
|--------|----------|
| `json-file` (défaut) | fichiers locaux, **pas de rotation par défaut** |
| `local` | format optimisé, rotation par défaut (recommandé) |
| `journald`, `syslog` | intégration système |
| `fluentd`, `gelf`, `splunk`, `awslogs`, `gcplogs` | envoi vers un collecteur |
| `none` | désactivé |

`docker logs` ne fonctionne qu'avec `json-file`, `local`, `journald` (et le *dual logging* de Docker récent).

### 4.2 Bonnes pratiques
- **Stdout/stderr**, une ligne = un événement, idéalement **JSON structuré** (niveau, horodatage, id de requête).
- **Rotation** (`max-size`, `max-file`) ou driver `local`.
- **Centralisation** : un agent (Promtail, Fluent Bit, Vector, Filebeat) lit les logs et les envoie à Loki/Elasticsearch.
- Pas de données sensibles dans les logs.
- Corrélation : identifiant de requête propagé entre services.

### 4.3 Stack Loki + Promtail + Grafana
Dans [`monitoring/`](monitoring/), Promtail découvre les conteneurs via le socket Docker, étiquette par conteneur/service et pousse vers Loki. Requête LogQL dans Grafana :
```
{service="web"} |= "error"
sum by (service) (rate({container=~".+"} |= "error" [5m]))
```

## 5. Métriques

### 5.1 `docker stats` et cgroups
Source de vérité : fichiers cgroups (`/sys/fs/cgroup/…/memory.current`, `cpu.stat`). Les outils les agrègent.

### 5.2 cAdvisor + Prometheus + Grafana
- **cAdvisor** expose les métriques par conteneur (`container_cpu_usage_seconds_total`, `container_memory_working_set_bytes`, `container_network_receive_bytes_total`…).
- **Prometheus** les collecte (pull) et les stocke (TSDB).
- **Grafana** les visualise (importez le dashboard communautaire n° 893 ou 14282) ; **Alertmanager** envoie les alertes.

Requêtes PromQL utiles :
```promql
rate(container_cpu_usage_seconds_total{name!=""}[1m])                     # CPU par conteneur
container_memory_working_set_bytes{name="demo-web"} / 1024 / 1024          # Mo
sum by (name) (rate(container_network_transmit_bytes_total[1m]))
container_oom_events_total
```

### 5.3 Métriques applicatives
Exposez `/metrics` (client Prometheus : `prometheus_client`, `prom-client`, micrometer…) ; méthode **RED** (Rate, Errors, Duration) pour les services, **USE** (Utilization, Saturation, Errors) pour les ressources.

### 5.4 Métriques du démon
`daemon.json` : `{"metrics-addr": "127.0.0.1:9323"}` expose les métriques de dockerd à Prometheus.

## 6. Alertes — quoi surveiller

- Conteneurs `unhealthy`, redémarrages répétés (`RestartCount` ↑), événements `oom`.
- Mémoire proche de la limite, CPU throttling, saturation disque (`/var/lib/docker`, logs).
- Latence/erreurs applicatives, files d'attente.
- Expiration des certificats, échec de sauvegarde.

Exemple de règle Prometheus :
```yaml
groups:
- name: docker
  rules:
  - alert: ContainerHighMemory
    expr: container_memory_working_set_bytes{name!=""} / container_spec_memory_limit_bytes{name!=""} > 0.9 and container_spec_memory_limit_bytes > 0
    for: 5m
    labels: { severity: warning }
```

## 7. Traces distribuées (aperçu)

OpenTelemetry (SDK dans l'appli) → **OTel Collector** (conteneur) → Jaeger/Tempo. Le contexte de trace (`traceparent`) est propagé dans les en-têtes HTTP.

## 8. Mise en pratique

```bash
cd modules/12-observabilite/monitoring
docker compose up -d
# Grafana http://127.0.0.1:3000 (admin / admin) → Explore → Prometheus ou Loki
# Prometheus http://127.0.0.1:9090/targets
docker run -d --name charge --cpus 0.5 alpine sh -c 'while :; do :; done'     # générer de la charge
```

## 9. À retenir

- Trois piliers + healthchecks.
- Logs structurés sur stdout avec rotation, centralisés.
- Métriques via cgroups → cAdvisor → Prometheus → Grafana.
- Alertez sur les symptômes (latence, erreurs) autant que sur les ressources.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 13](../13-orchestration/)
