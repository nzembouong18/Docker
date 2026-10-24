# Démos — Module 14

## Démo 1 — Du conteneur à runc (10 min)
```bash
docker run -d --name x alpine sleep 600
ps -ef --forest | grep -B2 -A3 'sleep 600'            # dockerd → containerd-shim → sleep
ID=$(docker inspect -f '{{.Id}}' x)
sudo ls /run/containerd/io.containerd.runtime.v2.task/moby/$ID
sudo runc --root /run/docker/runtime-runc/moby list
sudo jq '.process.args, .linux.namespaces[].type, .process.capabilities.bounding' /run/containerd/io.containerd.runtime.v2.task/moby/$ID/config.json
```

## Démo 2 — nsenter : déboguer sans shell (10 min)
```bash
docker run -d --name distro nginx:alpine      # remplacez par une image distroless pour l'exercice 14.5
PID=$(docker inspect -f '{{.State.Pid}}' distro)
sudo nsenter -t $PID -n ip a
sudo nsenter -t $PID -n ss -tlnp
sudo nsenter -t $PID -m ls /
docker rm -f distro
```

## Démo 3 — Le mini-docker (15 min)
```bash
sudo ./mini-docker.sh /bin/sh
# dans le "conteneur" :
hostname ; ps ; ip a ; cat /proc/1/cmdline ; mount | head
# depuis un autre terminal (hôte) :
lsns | grep mini ; ps -ef | grep unshare
```

## Démo 4 — CPU throttling visible (10 min)
```bash
docker run -d --name thr --cpus 0.2 alpine sh -c 'while :; do :; done'
CG=/sys/fs/cgroup/system.slice/docker-$(docker inspect -f '{{.Id}}' thr).scope
sleep 5; grep -E 'nr_periods|nr_throttled|throttled_usec' $CG/cpu.stat
docker update --cpus 1 thr; sleep 5; grep -E 'nr_throttled' $CG/cpu.stat    # n'augmente plus
docker rm -f thr
```

## Démo 5 — OverlayFS (10 min)
```bash
docker run -d --name ov alpine sh -c 'echo données > /nouveau; sleep 600'
docker exec ov rm /etc/motd
docker diff ov
D=$(docker inspect -f '{{.GraphDriver.Data.UpperDir}}' ov); sudo ls -la $D $D/etc
# fichier "whiteout" : c--------- 0,0 motd
docker rm -f ov
```

## Démo 6 — Réseau à la main (15 min)
```bash
sudo ip netns add ns1
sudo ip link add veth-host type veth peer name veth-ns
sudo ip link set veth-ns netns ns1
sudo ip addr add 10.99.0.1/24 dev veth-host && sudo ip link set veth-host up
sudo ip netns exec ns1 ip addr add 10.99.0.2/24 dev veth-ns
sudo ip netns exec ns1 ip link set veth-ns up
sudo ip netns exec ns1 ping -c1 10.99.0.1
sudo ip netns del ns1
```

## Démo 7 — strace d'un conteneur (5 min)
```bash
docker run -d --name web -p 8089:80 nginx:alpine
sudo strace -f -p $(docker inspect -f '{{.State.Pid}}' web) -e trace=accept4,openat 2>&1 | head -20 &
curl -s localhost:8089 >/dev/null; sleep 1; kill %1; docker rm -f web
```

## Démo 8 — Panne mystère (10 min, fil rouge de troubleshooting)
```bash
cat > /tmp/entry.sh <<'EOF'
#!/bin/bash
echo démarrage
exec sleep 300
EOF
sed -i 's/$/\r/' /tmp/entry.sh
docker run --rm -v /tmp/entry.sh:/entry.sh:ro alpine /entry.sh
# → "exec /entry.sh: no such file or directory" : (1) CRLF  (2) bash absent d'Alpine
```
