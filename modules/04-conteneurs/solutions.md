# Solutions — Module 04

## Lab 4.1
```python
# app.py
import signal, sys, time
signal.signal(signal.SIGTERM, lambda *_: (print("arrêt propre", flush=True), sys.exit(0)))
while True: time.sleep(1)
```
Avec handler : `docker stop` < 1 s. Sans handler (script Python en PID 1) : 10 s puis code 137. Avec `docker run --init` : tini transmet SIGTERM et Python (non PID 1) applique l'action par défaut ⇒ arrêt immédiat.

## Lab 4.2
```bash
docker run -d --name lim -m 100m --cpus 0.5 --pids-limit 50 alpine sleep 600
docker exec lim cat /sys/fs/cgroup/memory.max /sys/fs/cgroup/cpu.max /sys/fs/cgroup/pids.max
# 104857600 / 50000 100000 / 50
docker exec lim sh -c 'for i in $(seq 100); do sleep 100 & done'    # erreurs "can't fork" après ~50
```

## Lab 4.3
- Un crash du processus principal (`sudo kill -9 <pid>` depuis l'hôte) est détecté par le démon : avec `unless-stopped`, le conteneur redémarre et `RestartCount` s'incrémente. Un `docker stop` explicite, lui, empêche le redémarrage automatique.
- Redémarrage du démon : `unless-stopped`/`always` reviennent, `no` reste arrêté (sauf live-restore).

## Lab 4.4
```bash
docker run -d --name log --log-opt max-size=100k --log-opt max-file=2 alpine sh -c 'while :; do echo $(date) message; done'
sudo ls -lh $(docker inspect -f '{{.LogPath}}' log)*
docker logs --since 30s -t log | tail
```

## Lab 4.5
| Conteneur | Code | Cause | Correctif |
|-----------|------|-------|-----------|
| c1 | 1 | fichier inexistant | corriger le chemin |
| c2 | 137, OOMKilled=true | limite 6 Mo trop basse | augmenter `-m` |
| c3 | 127 (ou 126) | exécutable introuvable | bon chemin / `sh` |
| c4 | 1 | directive nginx invalide (voir `docker logs`) | corriger la config |
| c6 | 125, refus | port 8080 déjà utilisé | autre port ou supprimer c5 |
