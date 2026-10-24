# Démos — Module 04

## Démo 1 — Le piège du PID 1 et des signaux (10 min)
```bash
# sleep en PID 1 ignore SIGTERM : stop prend 10 s
docker run -d --name s1 alpine sleep 300
time docker stop s1                    # ≈ 10 s
docker inspect -f '{{.State.ExitCode}}' s1   # 137

# avec --init : arrêt immédiat
docker run -d --name s2 --init alpine sleep 300
time docker stop s2                    # < 1 s
docker rm s1 s2
```

## Démo 2 — Gérer SIGTERM correctement (Python) (5 min)
```bash
cat > handler.py <<'EOF'
import signal, sys, time
def bye(*_): print("SIGTERM reçu, arrêt propre", flush=True); sys.exit(0)
signal.signal(signal.SIGTERM, bye)
print("démarré", flush=True)
while True: time.sleep(1)
EOF
docker run -d --name py -v "$PWD/handler.py":/h.py python:3.12-alpine python /h.py
sleep 1; time docker stop py; docker logs py; docker rm py
```

## Démo 3 — OOM kill (5 min)
```bash
docker run --name oom -m 30m python:3.12-alpine python -c "a=bytearray(100*1024*1024)"
docker inspect -f 'OOM={{.State.OOMKilled}} exit={{.State.ExitCode}}' oom
docker rm oom
```

## Démo 4 — Limiter CPU et observer (5 min)
```bash
docker run -d --name burn --cpus 0.3 alpine sh -c 'while :; do :; done'
docker stats --no-stream burn          # ≈ 30 %
docker update --cpus 1 burn && sleep 3 && docker stats --no-stream burn   # ≈ 100 %
docker rm -f burn
```

## Démo 5 — Politique de redémarrage (5 min)
```bash
docker run -d --name crash --restart on-failure:3 alpine sh -c 'echo boom; exit 1'
sleep 8
docker inspect -f 'restarts={{.RestartCount}} status={{.State.Status}}' crash
docker logs crash
docker rm -f crash
```

## Démo 6 — Rotation des logs (5 min)
```bash
docker run -d --name noisy --log-opt max-size=1k --log-opt max-file=3 \
  alpine sh -c 'while :; do echo "ligne $(date)"; sleep 0.1; done'
sleep 5
sudo ls -lh $(docker inspect -f '{{.LogPath}}' noisy)*
docker rm -f noisy
```

## Démo 7 — Système de fichiers en lecture seule (5 min)
```bash
docker run --rm --read-only alpine touch /x                  # échec
docker run --rm --read-only --tmpfs /tmp alpine sh -c 'touch /tmp/x && echo ok'
docker run -d --name d alpine sh -c 'echo salut > /f; sleep 60'
docker diff d     # A /f
docker rm -f d
```

## Démo 8 — Healthcheck (5 min)
```bash
docker run -d --name hc --health-cmd 'test -f /ok' --health-interval 2s --health-retries 2 alpine sleep 300
sleep 6 && docker inspect -f '{{.State.Health.Status}}' hc    # unhealthy
docker exec hc touch /ok; sleep 4; docker inspect -f '{{.State.Health.Status}}' hc    # healthy
docker rm -f hc
```
