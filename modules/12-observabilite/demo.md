# Démos — Module 12

## Démo 1 — Outils natifs (5 min)
```bash
docker run -d --name w1 nginx:alpine && docker run -d --name w2 --cpus 0.3 alpine sh -c 'while :; do :; done'
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}'
docker events --since 1m --filter type=container &       # puis : docker restart w1
docker top w2
```

## Démo 2 — Healthcheck en action (5 min)
```bash
docker run -d --name hc --health-cmd 'test -f /tmp/ok' --health-interval 2s --health-retries 2 --health-start-period 3s alpine sleep 600
watch -n1 "docker inspect -f '{{.State.Health.Status}}' hc"      # starting → unhealthy
docker exec hc touch /tmp/ok                                      # → healthy
docker inspect -f '{{json .State.Health}}' hc | python3 -m json.tool | head -20
docker events --filter event=health_status --since 1m
```

## Démo 3 — Stack d'observabilité (15 min)
```bash
cd monitoring && docker compose up -d
docker run -d --name demo-web -p 8085:80 nginx:alpine
docker run -d --name charge --cpus 0.5 alpine sh -c 'while :; do :; done'
for i in $(seq 50); do curl -s localhost:8085/inexistant >/dev/null; done
```
1. Prometheus → *Status > Targets* : `cadvisor` UP.
2. Requête : `rate(container_cpu_usage_seconds_total{name="charge"}[1m])` ≈ 0,5.
3. Grafana → *Explore* → Loki : `{container="demo-web"} |= "404"`.
4. Nettoyage : `docker rm -f demo-web charge && docker compose down -v`.

## Démo 4 — Rotation des logs et driver `local` (5 min)
```bash
docker run -d --name l1 --log-driver local --log-opt max-size=1m --log-opt max-file=3 \
  alpine sh -c 'while :; do echo "$(date) {\"level\":\"info\",\"msg\":\"hello\"}"; done'
sleep 5; docker logs --tail 3 l1; docker inspect -f '{{.HostConfig.LogConfig}}' l1; docker rm -f l1
```

## Démo 5 — Alerte OOM (5 min)
```bash
docker events --filter event=oom &
docker run --rm -m 20m python:3.12-alpine python -c "a=bytearray(500*1024*1024)"
```

## Démo 6 — Métriques du démon (5 min)
```bash
echo '{"metrics-addr":"127.0.0.1:9323"}' | sudo tee -a /tmp/daemon-metrics.json     # à fusionner dans /etc/docker/daemon.json
curl -s localhost:9323/metrics | grep -E '^engine_daemon_container_states_containers'
```
