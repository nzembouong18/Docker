# Labos — Module 14

## Lab 14.1 — Anatomie d'un conteneur (30 min)
Pour un conteneur nginx, relevez et expliquez en un tableau :
- la chaîne de processus (dockerd, shim, nginx) avec `pstree -ap`,
- ses 7 namespaces (`lsns -p <pid>`),
- son cgroup et ses limites (`memory.max`, `cpu.max`, `pids.max`),
- son `upperdir`/`lowerdir` overlay,
- ses capabilities (`grep Cap /proc/<pid>/status` puis `capsh --decode=`),
- son profil seccomp (`grep Seccomp /proc/<pid>/status`).

## Lab 14.2 — Étendre mini-docker (60 min)
Améliorez [`mini-docker.sh`](mini-docker.sh) :
1. remplacez `chroot` par `pivot_root` (cherchez pourquoi c'est plus sûr),
2. ajoutez un réseau : namespace `net` + paire veth + bridge + `MASQUERADE` pour qu'il atteigne Internet,
3. utilisez `overlayfs` (`lowerdir` = rootfs Alpine, `upperdir` temporaire) pour que le rootfs de base reste intact,
4. ajoutez `--user` : lancez en `unshare --user --map-root-user`.

## Lab 14.3 — Chasse aux pannes (60 min)
Pour chaque cas, identifiez la cause racine en < 5 min et appliquez le correctif :
```bash
# A
docker run -d --name a -m 16m python:3.12-alpine python -c "x=[bytearray(10**6) for _ in range(100)]; print(len(x))"
# B
printf '#!/bin/sh\r\necho hi\r\n' > e.sh; chmod +x e.sh; docker run --rm -v $PWD/e.sh:/e.sh alpine /e.sh
# C
docker run --rm --platform linux/arm64 alpine uname -m   # sans binfmt/QEMU installé
# D
docker run -d --name d -v /nexiste/pas:/data alpine sleep 100 ; docker run --rm --mount type=bind,src=/nexiste/pas,dst=/data alpine ls /data
# E
docker run -d --name e --cpus 0.1 alpine sh -c 'while :; do :; done' ; (observez le throttling)
```

## Lab 14.4 — Tuning (45 min)
Une API (JVM ou Node) dans un conteneur limité à 512 Mo / 1 CPU : mesurez p95 avec `hey`/`wrk`, puis ajustez (heap, `GOMAXPROCS`/`UV_THREADPOOL_SIZE`, limites CPU, `--init`, tmpfs) et documentez 3 optimisations avec résultats chiffrés.

## Lab 14.5 — Dépanner un conteneur distroless (30 min)
Lancez une image distroless. Sans la modifier, obtenez : ses variables d'environnement, ses connexions réseau, la liste de ses fichiers ouverts, et exécutez un `tcpdump` sur son interface. Utilisez `nsenter`, `/proc` et un side-car (`--pid container:`/`--net container:`).

## Lab 14.6 — Durcir et tracer le démon (30 min)
Écrivez un `daemon.json` (log `local` avec rotation, `live-restore`, `no-new-privileges`, address pools, métriques). Redémarrez le démon, prouvez que `live-restore` garde un conteneur actif pendant un `restart docker`.

> Corrigés : [solutions.md](solutions.md)
