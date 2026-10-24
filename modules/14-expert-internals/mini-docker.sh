#!/usr/bin/env bash
# mini-docker.sh — un "conteneur" fait main avec namespaces + chroot + cgroup v2.
# Usage: sudo ./mini-docker.sh [commande...]   (défaut: /bin/sh)
# Pédagogique uniquement. Nécessite root, cgroups v2, curl, tar.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Lancer en root (sudo)"; exit 1; }

ROOTFS=${ROOTFS:-/tmp/mini-docker/rootfs}
CG=/sys/fs/cgroup/mini-docker-$$
MEM_MAX=${MEM_MAX:-67108864}      # 64 Mo
PIDS_MAX=${PIDS_MAX:-50}

# 1) Système de fichiers racine : on réutilise le contenu d'alpine via docker export,
#    ou on télécharge le minirootfs officiel.
if [ ! -x "$ROOTFS/bin/sh" ]; then
  mkdir -p "$ROOTFS"
  if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
    cid=$(docker create alpine:3.20)
    docker export "$cid" | tar -x -C "$ROOTFS"
    docker rm "$cid" >/dev/null
  else
    arch=$(uname -m)
    curl -fsSL "https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/${arch}/alpine-minirootfs-3.20.3-${arch}.tar.gz" \
      | tar -xz -C "$ROOTFS"
  fi
fi

# 2) cgroup v2 : limites mémoire et nombre de processus
mkdir "$CG"
echo "$MEM_MAX"  > "$CG/memory.max"
echo "$PIDS_MAX" > "$CG/pids.max"
cleanup() { rmdir "$CG" 2>/dev/null || true; }
trap cleanup EXIT

# 3) Namespaces + chroot. Le processus s'ajoute lui-même au cgroup avant de démarrer.
#    --pid --fork : nouveau namespace PID ; --mount-proc : /proc propre
#    --uts : hostname ; --ipc ; --net : pile réseau vide ; --mount : montages privés
CMD=("${@:-/bin/sh}")
echo ">>> démarrage du conteneur (cgroup=$CG, rootfs=$ROOTFS)"
unshare --pid --fork --mount --uts --ipc --net \
  bash -c '
    echo $$ > '"$CG"'/cgroup.procs
    mount --make-rprivate /
    mount --bind '"$ROOTFS"' '"$ROOTFS"'
    mount -t proc proc '"$ROOTFS"'/proc
    hostname mini-conteneur
    exec chroot '"$ROOTFS"' "$@"
  ' _ "${CMD[@]}"
