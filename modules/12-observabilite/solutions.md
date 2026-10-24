# Solutions — Module 12

## Lab 12.1
```python
@app.get("/live")
def live(): return "ok"

@app.get("/ready")
def ready():
    cache.ping()
    with db() as c: c.execute("SELECT 1")
    return "ready"
```
Délai avant `unhealthy` ≈ `interval × retries` (+ `timeout`). Ex. 10 s × 3 = ~30 s. Autoheal :
```yaml
  autoheal:
    image: willfarrell/autoheal:1.2.0
    volumes: ["/var/run/docker.sock:/var/run/docker.sock"]
    environment: { AUTOHEAL_CONTAINER_LABEL: autoheal }
  web: { labels: { autoheal: "true" } }
```
(Note : `autoheal` monte le socket Docker : à réserver aux environnements maîtrisés ; Swarm/Kubernetes font cela nativement.)

## Lab 12.2
```python
import json, logging, time, uuid
class J(logging.Formatter):
    def format(self, r): return json.dumps({"ts": time.time(), "level": r.levelname, "msg": r.getMessage()})
```
LogQL :
- Erreurs : `{service="web"} | json | level="ERROR"`
- Taux : `sum(rate({service="web"} | json | level="ERROR" [1m]))`

Rotation commune :
```yaml
x-logging: &logging
  driver: local
  options: { max-size: "10m", max-file: "3" }
services:
  web: { logging: *logging }
```

## Lab 12.3
Requêtes : CPU `sum by (name) (rate(container_cpu_usage_seconds_total{name!=""}[1m]))` ; mémoire `container_memory_working_set_bytes{name!=""}` ; redémarrages via les événements ou `engine_daemon_container_actions_seconds_count{action="start"}` ; ajoutez un fichier `dashboards.yml` de provisioning pointant vers le dossier des JSON.

## Lab 12.4
```yaml
- alert: ContainerRestarting
  expr: changes(container_start_time_seconds{name!=""}[10m]) > 2
- alert: CadvisorDown
  expr: up{job="cadvisor"} == 0
  for: 1m
```
Déclenchement : `docker stop cadvisor` ; conteneur à 25 Mo qui alloue 40 Mo ; boucle de crash `--restart always`.

## Lab 12.5
```python
from prometheus_client import Counter, Histogram, generate_latest
REQ = Counter("http_requests_total", "Requêtes", ["code"])
LAT = Histogram("http_request_duration_seconds", "Latence")
```
p95 : `histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))`.
