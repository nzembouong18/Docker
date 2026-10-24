# Solutions — Module 01

## Lab 1.1
- `docker inspect -f '{{.State.Pid}}' lab11` donne par ex. `12345`.
- `sudo ls -l /proc/12345/ns` affiche des liens du type `pid -> 'pid:[4026532xxx]'`.
- Les namespaces **pid, net, mnt, uts, ipc, cgroup** diffèrent de ceux du shell hôte. `user` est généralement **identique** (pas de userns-remap par défaut).
- `hostname` dans le conteneur = ID court du conteneur (namespace UTS), différent de l'hôte.

## Lab 1.2
- Deux boucles consomment ~50 % d'un CPU **au total** (≈ 50 % dans `docker stats`) : la limite `--cpus 0.5` est appliquée par le cgroup.
- `cat /sys/fs/cgroup/cpu.max` → `50000 100000` (quota 50 ms par période de 100 ms).

## Lab 1.3
Chemin : `docker` (CLI) → API REST via `/var/run/docker.sock` → `dockerd` → (pull depuis le registry si besoin) → `containerd` → `containerd-shim` → `runc` → crée namespaces + cgroups + monte l'overlayfs → exec du processus nginx. Le `-p 8080:80` crée une règle NAT (iptables/nftables) + `docker-proxy`.

## Lab 1.4
1. **Conteneurs** : densité, démarrage rapide.
2. **VM** : un noyau Windows ne tourne pas dans un conteneur Linux.
3. **VM / micro-VM (Firecracker), gVisor ou Kata** : le noyau partagé est un risque.
4. **Conteneurs** (Dev Containers / Compose) : reproductibilité.
