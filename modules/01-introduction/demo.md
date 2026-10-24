# Démos — Module 01

> Prérequis : un hôte Linux (ou WSL2). Pour ces démos « sans Docker », vous avez besoin de `sudo` et du paquet `util-linux`.

## Démo 1 — Un conteneur, c'est un processus

Avec Docker installé :

```bash
docker run -d --name demo-sleep alpine sleep 600
docker top demo-sleep            # vu depuis Docker
ps aux | grep "sleep 600"        # vu depuis l'hôte : c'est un processus normal !
docker exec demo-sleep ps        # vu depuis le conteneur : PID 1
docker rm -f demo-sleep
```

**Ce qu'on montre** : le même processus a un PID élevé sur l'hôte mais PID 1 dans son namespace.

## Démo 2 — Namespaces à la main (sans Docker)

```bash
# Nouveau namespace PID + montage de /proc propre
sudo unshare --pid --fork --mount-proc bash
ps aux          # on ne voit que 2 processus
echo $$         # PID 1 ou 2
exit
```

```bash
# Nouveau namespace réseau : aucune interface sauf lo
sudo unshare --net bash -c 'ip link'
```

```bash
# Nouveau namespace UTS : hostname isolé
sudo unshare --uts bash -c 'hostname isole; hostname'
hostname        # inchangé sur l'hôte
```

## Démo 3 — cgroups : limiter la mémoire

```bash
docker run --rm -m 50m alpine sh -c 'cat /sys/fs/cgroup/memory.max'
# 52428800  (50 Mo, cgroup v2)

# Dépasser la limite → OOM kill
docker run --rm -m 20m python:3.12-alpine \
  python -c "x = bytearray(200*1024*1024); print('ok')"
echo "code retour: $?"     # 137 = SIGKILL (OOM killer)
```

## Démo 4 — Union filesystem : les couches

```bash
docker pull nginx:1.27-alpine
docker image history nginx:1.27-alpine      # une ligne = une couche
docker inspect nginx:1.27-alpine --format '{{json .RootFS.Layers}}' | python3 -m json.tool
docker run -d --name n nginx:1.27-alpine
docker inspect n --format '{{.GraphDriver.Name}} {{.GraphDriver.Data.MergedDir}}'
docker rm -f n
```

## Démo 5 — Le démon et son socket

```bash
ls -l /var/run/docker.sock
curl --unix-socket /var/run/docker.sock http://localhost/version | python3 -m json.tool
curl --unix-socket /var/run/docker.sock http://localhost/containers/json
```

**Message** : `docker` n'est qu'un client HTTP de l'API du démon. ⚠️ Qui accède à ce socket est *de facto* root sur l'hôte.

## Démo 6 — Hello, world

```bash
docker run hello-world
```
Lisez la sortie : elle décrit exactement les 4 étapes (client → démon → pull → run).
