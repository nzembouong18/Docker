# Module 08 — Réseau Docker

> **Durée** : 3 h · **Niveau** : 🟡

## 1. Le modèle réseau

Chaque conteneur a son **propre namespace réseau** : interfaces, IP, table de routage, règles iptables. Docker relie ces namespaces via des **réseaux virtuels** (pilotes / *drivers*).

```
 Hôte
 ├─ eth0 (192.168.1.10)  ──── Internet
 ├─ docker0 / br-xxxx (172.17.0.1)  ← pont (bridge) Linux
 │     ├─ veth ── eth0 (172.17.0.2) conteneur A
 │     └─ veth ── eth0 (172.17.0.3) conteneur B
 └─ iptables (NAT, FORWARD) ← publication de ports (-p)
```

## 2. Les pilotes

| Pilote | Description | Usage |
|--------|-------------|-------|
| `bridge` | Réseau privé interne à l'hôte (défaut) | Conteneurs sur un même hôte |
| `host` | Partage la pile réseau de l'hôte (pas d'isolation, pas de `-p`) | Performance, outils réseau (Linux) |
| `none` | Aucune interface sauf `lo` | Isolation totale, jobs batch |
| `overlay` | Réseau multi-hôtes (VXLAN) | Swarm |
| `macvlan` / `ipvlan` | Conteneur avec sa propre adresse MAC/IP sur le LAN | Intégration avec réseau physique, legacy |

```bash
docker network ls
docker network inspect bridge
```

## 3. Bridge par défaut vs bridge défini par l'utilisateur

| | `bridge` par défaut | Bridge utilisateur |
|--|--------------------|--------------------|
| Résolution DNS par **nom** | ❌ (IP ou `--link` obsolète) | ✅ DNS embarqué (127.0.0.11) |
| Isolation | Tous les conteneurs mélangés | Par réseau |
| Connexion/déconnexion à chaud | Non | Oui |

> 👉 **Toujours créer ses propres réseaux.**

```bash
docker network create app-net
docker run -d --name db  --network app-net -e POSTGRES_PASSWORD=x postgres:16-alpine
docker run --rm --network app-net alpine ping -c1 db     # résolution par nom ✅
docker run --rm --network app-net alpine nslookup db
```

Alias de service : `--network-alias`. Plusieurs réseaux : `docker network connect|disconnect`.

Sous-réseau personnalisé :
```bash
docker network create --subnet 10.10.0.0/24 --gateway 10.10.0.1 mon-net
docker run --network mon-net --ip 10.10.0.50 …
```

Réseau **interne** (sans accès extérieur) : `docker network create --internal backend`.

## 4. Publication de ports et NAT

`-p 8080:80` crée :
- une règle DNAT iptables (`DOCKER` chain) : hôte:8080 → conteneur:80,
- un `docker-proxy` pour le loopback/IPv6.

```bash
docker run -d -p 127.0.0.1:8080:80 nginx       # local seulement
sudo iptables -t nat -L DOCKER -n
```

Sortie vers Internet : règle MASQUERADE (SNAT) automatique.

⚠️ Docker écrit dans iptables **avant** ufw/firewalld : un port publié est ouvert au monde même si ufw le bloque. Solutions : lier à `127.0.0.1`, utiliser la chaîne `DOCKER-USER`, ou un reverse proxy unique.

## 5. Le DNS dans Docker

- Sur un réseau utilisateur, le **DNS embarqué** résout les noms de conteneurs et de services Compose et relaie le reste vers le DNS de l'hôte.
- `--dns 1.1.1.1`, `--dns-search`, `--add-host nom:ip` pour personnaliser `/etc/resolv.conf` et `/etc/hosts`.
- Le **round-robin DNS** : plusieurs conteneurs avec le même alias sur un réseau → résolution vers plusieurs IP.

## 6. Communiquer entre conteneurs : règles d'or

1. Sur un **même réseau** : utilisez le **nom** et le **port du conteneur** (pas le port publié).
   `postgres://db:5432`, pas `localhost:5432` ni `localhost:15432`.
2. **Publiez uniquement** ce qui doit l'être (le point d'entrée) ; la base de données reste sur un réseau interne.
3. Séparez frontend / backend avec des réseaux distincts.

```
 Internet ─▶ [proxy] ──frontend──▶ [api] ──backend(internal)──▶ [db]
```

## 7. Mode host, none, container

```bash
docker run --rm --network host nginx            # ports de l'hôte directement (Linux uniquement)
docker run --rm --network none alpine ip a      # seulement lo
docker run --network container:web nicolaka/netshoot   # partage la pile de 'web' → debug réseau
```

## 8. Macvlan (aperçu)

```bash
docker network create -d macvlan --subnet 192.168.1.0/24 --gateway 192.168.1.1 \
  -o parent=eth0 lan
docker run -d --network lan --ip 192.168.1.200 nginx
```
Le conteneur apparaît comme une machine du LAN (l'hôte ne peut pas le joindre sans interface macvlan dédiée).

## 9. Overlay et Swarm (aperçu)

Un réseau `overlay` encapsule le trafic (VXLAN, UDP 4789) entre hôtes d'un cluster Swarm. Créé automatiquement pour les stacks ; `--opt encrypted` chiffre le trafic de données. Voir module 13.

## 10. Reverse proxy

Un reverse proxy (nginx, Traefik, Caddy, HAProxy) reçoit le trafic externe et le route vers les conteneurs selon l'hôte/chemin, gère TLS, compression, etc.

Voir [`proxy-demo/`](proxy-demo/) : nginx devant deux services, sur un réseau commun.

Traefik découvre automatiquement les services via des **labels** :
```yaml
labels:
  - traefik.http.routers.api.rule=Host(`api.localhost`)
  - traefik.http.services.api.loadbalancer.server.port=5000
```

## 11. Diagnostic réseau

```bash
docker exec c cat /etc/resolv.conf /etc/hosts
docker exec c ip a ; docker exec c ip r
docker exec c nc -zv db 5432
docker run --rm -it --network container:c nicolaka/netshoot    # tcpdump, dig, curl, ss…
docker run --rm -it --net host nicolaka/netshoot tcpdump -i docker0
ss -tlnp | grep docker-proxy
docker network inspect app-net --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\n"}}{{end}}'
```

Erreurs classiques :
| Symptôme | Cause probable |
|----------|----------------|
| `could not translate host name` | réseau par défaut ou réseaux différents |
| `connection refused` sur `localhost` | l'appli écoute sur `127.0.0.1` au lieu de `0.0.0.0` |
| Port inaccessible depuis l'extérieur | pas de `-p`, ou lié à 127.0.0.1, ou pare-feu cloud |
| `port is already allocated` | un autre processus utilise le port hôte |

## 12. À retenir

- Créez des **réseaux bridge utilisateur** ; résolution par nom.
- Publiez le minimum ; isolez avec des réseaux `internal`.
- L'appli doit écouter sur `0.0.0.0`.
- `netshoot` est votre meilleur ami pour diagnostiquer.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 09](../09-compose/)
