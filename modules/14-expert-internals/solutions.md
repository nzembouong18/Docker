# Solutions — Module 14

## Lab 14.1
```bash
PID=$(docker inspect -f '{{.State.Pid}}' c)
pstree -ap $(pgrep -f containerd-shim | head -1)
sudo lsns -p $PID
ID=$(docker inspect -f '{{.Id}}' c)
cat /sys/fs/cgroup/system.slice/docker-$ID.scope/{memory.max,cpu.max,pids.max}
docker inspect -f '{{.GraphDriver.Data.UpperDir}}' c
grep Cap /proc/$PID/status ; capsh --decode=00000000a80425fb
grep Seccomp /proc/$PID/status      # Seccomp: 2 (filtre actif)
```

## Lab 14.2 (pistes)
- `pivot_root` : `mount --bind rootfs rootfs; cd rootfs; mkdir old; pivot_root . old; umount -l /old`. Avec `chroot` un processus root peut s'échapper (`chroot` imbriqué + `..`), pas avec `pivot_root` + démontage de l'ancienne racine.
- Réseau : `ip netns` ou `unshare --net` + `nsenter`, veth, `brctl`/`ip link add br0 type bridge`, `iptables -t nat -A POSTROUTING -s 10.99.0.0/24 -j MASQUERADE`, `sysctl net.ipv4.ip_forward=1`.
- Overlay : `mount -t overlay overlay -o lowerdir=$ROOTFS,upperdir=$U,workdir=$W $MERGED`.

## Lab 14.3
| | Cause | Correctif |
|--|------|-----------|
| A | OOM (limite 16 Mo) → code 137, `OOMKilled=true` | augmenter `-m`, corriger la fuite |
| B | CRLF dans le shebang (`/bin/sh\r`) → « no such file or directory » | `dos2unix`/`sed -i 's/\r$//'`, `.gitattributes` `*.sh text eol=lf` |
| C | `exec format error` : QEMU/binfmt absent | `docker run --privileged --rm tonistiigi/binfmt --install all` |
| D | `-v` crée le dossier (root) ; `--mount` échoue (« bind source path does not exist ») | préférer `--mount` pour détecter les fautes |
| E | `nr_throttled` augmente continuellement | relever la limite ou réduire la charge |

## Lab 14.4 (exemples de gains)
- JVM : `-XX:MaxRAMPercentage=75` au lieu du heap par défaut → fin des OOM.
- Go : `automaxprocs` → latence p95 divisée (moins de throttling).
- Node : `--max-old-space-size` cohérent avec la limite ; `--init` pour la gestion des signaux.
- `tmpfs` pour fichiers temporaires → I/O réduites.

## Lab 14.5
```bash
PID=$(docker inspect -f '{{.State.Pid}}' c)
sudo cat /proc/$PID/environ | tr '\0' '\n'
sudo nsenter -t $PID -n ss -tanp
sudo ls -l /proc/$PID/fd
docker run --rm -it --net container:c --cap-add NET_ADMIN --cap-add NET_RAW nicolaka/netshoot tcpdump -i eth0 -n
```

## Lab 14.6
```bash
sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.bak
sudo tee /etc/docker/daemon.json <<'EOF'
{ "log-driver":"local","log-opts":{"max-size":"10m","max-file":"3"},
  "live-restore":true,"no-new-privileges":true,"metrics-addr":"127.0.0.1:9323",
  "default-address-pools":[{"base":"10.200.0.0/16","size":24}] }
EOF
sudo dockerd --validate --config-file=/etc/docker/daemon.json
sudo systemctl restart docker
docker run -d --name live alpine sleep 600
sudo systemctl restart docker && docker ps    # le conteneur est toujours "Up" grâce à live-restore
```
