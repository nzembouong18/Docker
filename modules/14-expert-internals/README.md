# Module 14 — Expert : internals, performance et troubleshooting

> **Durée** : 4 h · **Niveau** : 🔴 · Script : [`mini-docker.sh`](mini-docker.sh).

## 1. La pile d'exécution en détail

```
docker CLI ─HTTP/unix─▶ dockerd ─gRPC─▶ containerd ─▶ containerd-shim-runc-v2 ─▶ runc ─▶ processus
                           │                │                  │
                      réseau, volumes,   images, snapshots,   survit au redémarrage
                      build (BuildKit)   tâches               du démon (live-restore)
```

- **dockerd** : API, réseaux (libnetwork), volumes, build (BuildKit), plugins.
- **containerd** : pull des images, snapshotters (overlayfs), cycle de vie des tâches.
- **shim** : un par conteneur ; garde stdio ouverts, récupère le code de sortie, permet à containerd de redémarrer sans tuer les conteneurs.
- **runc** : lit un **bundle OCI** (`config.json` + `rootfs/`), crée namespaces/cgroups, applique seccomp/capabilities, `exec` le processus puis s'efface.

Voir un bundle : 
```bash
docker run -d --name x alpine sleep 300
sudo ls /run/containerd/io.containerd.runtime.v2.task/moby/$(docker inspect -f '{{.Id}}' x)/
sudo cat /run/containerd/io.containerd.runtime.v2.task/moby/$(docker inspect -f '{{.Id}}' x)/config.json | jq '.linux.namespaces, .linux.resources'
```

Outils : `ctr` et `nerdctl` (parler directement à containerd), `crictl` (CRI), `runc list`.

## 2. Namespaces : les 8 types

| Namespace | Isole | Flag `unshare` |
|-----------|-------|----------------|
| `mnt` | points de montage | `--mount` |
| `pid` | numéros de processus | `--pid` |
| `net` | interfaces, routes, iptables | `--net` |
| `ipc` | mémoire partagée, files de messages | `--ipc` |
| `uts` | hostname, domainname | `--uts` |
| `user` | UID/GID (root ≠ root hôte) | `--user` |
| `cgroup` | vue de la hiérarchie cgroup | `--cgroup` |
| `time` | horloges monotone/boot | `--time` |

Outils : `lsns`, `nsenter`, `ls -l /proc/<pid>/ns`.

```bash
PID=$(docker inspect -f '{{.State.Pid}}' mon-conteneur)
sudo nsenter -t $PID -n ip a                 # entrer dans le namespace réseau (outils de l'hôte !)
sudo nsenter -t $PID -m -u -i -n -p sh       # presque comme docker exec
sudo nsenter -t $PID -n ss -tlnp
```
Très utile pour déboguer un conteneur **sans shell ni outils** (distroless) avec ceux de l'hôte.

## 3. cgroups v2

Hiérarchie unique dans `/sys/fs/cgroup`. Contrôleurs : `cpu`, `memory`, `io`, `pids`, `cpuset`.

| Fichier | Rôle |
|---------|------|
| `memory.max` / `memory.high` | limite dure / seuil de ralentissement |
| `memory.current` / `memory.events` | usage / compteurs (oom, oom_kill) |
| `cpu.max` | `quota période` (ex. `50000 100000` = 0,5 CPU) |
| `cpu.weight` | poids relatif (≈ `--cpu-shares`) |
| `cpu.stat` | `nr_throttled`, `throttled_usec` : indicateur de **CPU throttling** |
| `pids.max` | nombre max de processus |
| `io.max` | limites I/O par périphérique |

```bash
CG=/sys/fs/cgroup/system.slice/docker-$(docker inspect -f '{{.Id}}' x).scope
cat $CG/memory.max $CG/cpu.max $CG/pids.current
grep -E 'throttled|nr_' $CG/cpu.stat
```

> ⚠️ **Piège classique** : limites CPU trop basses ⇒ throttling ⇒ latences élevées même si le CPU « n'est pas à 100 % ». Surveillez `container_cpu_cfs_throttled_periods_total`. Les runtimes (JVM, Go, Node) doivent respecter les limites du cgroup (`-XX:+UseContainerSupport`, `GOMAXPROCS`/`automaxprocs`).

## 4. Le système de fichiers : overlay2

```
upperdir (RW) ─┐
lowerdir (RO) ─┼─▶ merged  (vu par le conteneur)   + workdir
```
```bash
docker inspect -f '{{json .GraphDriver.Data}}' x | jq
sudo mount | grep overlay
```
- Lecture : trouvée dans la couche la plus haute qui contient le fichier.
- Écriture : *copy-up* du fichier complet dans `upperdir` (coûteux pour de gros fichiers → utilisez des volumes).
- Suppression : *whiteout* (fichier spécial) dans l'upper.
- Stockage : `/var/lib/docker/overlay2`, métadonnées `/var/lib/docker/image`, volumes `/var/lib/docker/volumes`.
- Autres drivers : `btrfs`, `zfs`, `fuse-overlayfs` (rootless), snapshotter `stargz` (lazy pulling).

## 5. Construire un conteneur « à la main »

[`mini-docker.sh`](mini-docker.sh) assemble les briques en ~30 lignes : rootfs Alpine + `unshare` (pid, mnt, uts, ipc, net) + `chroot` + limites cgroup v2.

```bash
sudo ./mini-docker.sh /bin/sh
/ # hostname          # mini-conteneur
/ # ps                # PID 1 : notre shell
/ # ip a              # seulement lo (down) : pas de réseau
```
Ce qui manque par rapport à Docker : réseau (veth + bridge + NAT), images en couches (overlayfs), seccomp, capabilities, userns, pivot_root (plus sûr que chroot), gestion des volumes, API.

## 6. Réseau sous le capot

```bash
ip link show type bridge ; ip link show type veth ; bridge link
sudo iptables -t nat -S | grep -i docker ; sudo iptables -S DOCKER-USER
sudo nsenter -t $PID -n ip route
```
Création d'un réseau à la main (résumé) : `ip netns add` → paire `veth` → une extrémité dans le namespace, l'autre sur le bridge → IP + route par défaut → règle `MASQUERADE`.

## 7. Performance

| Sujet | Conseils |
|-------|----------|
| **Build** | cache mounts, ordre des couches, `.dockerignore`, buildx cache distant |
| **Démarrage** | images petites, peu de couches, lazy pulling, éviter les init lourds |
| **I/O** | volumes plutôt que couche inscriptible, `tmpfs` pour le temporaire, éviter les gros copy-up |
| **CPU** | requests/limits réalistes, surveiller le throttling |
| **Mémoire** | limites + comportement du runtime (heap JVM, GC), `memory.high` |
| **Réseau** | `host` si latence critique, éviter NAT inutile, MTU cohérente avec l'overlay |
| **Logs** | driver `local`, pas de logs verbeux synchrones |
| **Disque** | `docker system prune` planifié, rotation des logs, `overlay2` sur XFS `pquota` |

## 8. Méthodologie de dépannage

1. **Décrire** le symptôme précisément (quoi, depuis quand, quel conteneur).
2. **État** : `docker ps -a`, `docker inspect` (State.ExitCode, OOMKilled, Error, Health), `docker events`.
3. **Logs** : `docker logs`, `journalctl -u docker`, `journalctl -u containerd`.
4. **Reproduire** : `docker run -it --entrypoint sh image`, mêmes variables/volumes.
5. **Réseau** : DNS (`nslookup`), connectivité (`nc -zv`), `netshoot`, `tcpdump`.
6. **Ressources** : `docker stats`, cgroups, `dmesg | grep -i oom`.
7. **Observer le processus** : `strace -f -p <pid>`, `lsof`, `/proc/<pid>/{status,limits,fd}`.
8. **Isoler** : changer **une** variable à la fois ; comparer avec un conteneur sain.

### Catalogue des pannes classiques

| Symptôme | Cause fréquente | Diagnostic / solution |
|----------|------------------|-----------------------|
| `Exited (137)` | OOM ou SIGKILL | `inspect .State.OOMKilled`, `dmesg`, augmenter la mémoire / corriger la fuite |
| `Exited (139)` | Segfault | image/arch incorrecte (amd64 sur arm64 ?), bibliothèque |
| `exec format error` | Mauvaise architecture ou shebang CRLF | `docker image inspect --format '{{.Architecture}}'`, `--platform`, fins de ligne LF |
| `exec /entrypoint.sh: no such file or directory` | CRLF ou interpréteur absent (alpine sans bash) | `dos2unix`, `#!/bin/sh` |
| `permission denied` sur volume | UID différent, SELinux | `chown`, `-u`, `:Z` |
| `no space left on device` | `/var/lib/docker` plein, logs, images | `docker system df`, `prune`, rotation |
| `port is already allocated` | Port hôte pris | `ss -tlnp`, autre port |
| Démarre puis s'arrête | Processus principal termine / mauvais CMD | `logs`, `run -it --entrypoint sh` |
| `network not found` / DNS KO | réseau supprimé, bridge par défaut | recréer, réseau utilisateur |
| Pull lent / `toomanyrequests` | limite Docker Hub | login, miroir, cache pull-through |
| Build très lent | contexte énorme, cache invalidé | `.dockerignore`, ordre des couches |
| Conteneur `unhealthy` | check trop strict/timeout | `inspect .State.Health.Log` |
| Heure incorrecte | fuseau/NTP | `TZ=`, monter `/etc/localtime:ro` |
| Zombies, signaux ignorés | PID 1 inadapté | `--init`, forme exec |
| Daemon ne démarre pas | `daemon.json` invalide | `dockerd --validate`, `journalctl -u docker` |

## 9. Outils d'investigation

```bash
docker debug <conteneur>                         # shell éphémère avec outils (Docker Desktop/Subscription)
docker run --rm -it --pid container:x --net container:x --cap-add SYS_PTRACE nicolaka/netshoot   # side-car de debug
docker run --rm -it --pid container:x --cap-add SYS_PTRACE alpine sh -c 'apk add strace && strace -fp 1'
sudo strace -f -p $(docker inspect -f '{{.State.Pid}}' x) -e trace=network,file
sudo cat /proc/$PID/limits ; sudo ls -l /proc/$PID/fd | wc -l
journalctl -u docker.service -f
docker system events --format '{{json .}}'
dive IMAGE ; docker scout ; trivy image
```

## 10. Configuration du démon (`/etc/docker/daemon.json`)

```json
{
  "log-driver": "local",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true,
  "default-address-pools": [{ "base": "10.200.0.0/16", "size": 24 }],
  "registry-mirrors": ["https://mirror.example.com"],
  "metrics-addr": "127.0.0.1:9323",
  "no-new-privileges": true,
  "default-ulimits": { "nofile": { "Name": "nofile", "Hard": 65536, "Soft": 65536 } },
  "features": { "containerd-snapshotter": true }
}
```
Rechargement : `sudo systemctl reload docker` (SIGHUP) pour certaines options, sinon `restart`.
`live-restore` permet de redémarrer dockerd sans arrêter les conteneurs.

## 11. À retenir

- Docker = assemblage de primitives noyau (namespaces, cgroups, overlayfs, seccomp, capabilities).
- `nsenter`, `/proc`, cgroups et `strace` sont les outils de l'expert.
- Un diagnostic se fait méthodiquement : état → logs → reproduire → ressources → processus.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 15 — Projet final](../15-projet-final/)
