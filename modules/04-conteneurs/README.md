# Module 04 — Les conteneurs en profondeur

> **Durée** : 3 h · **Niveau** : 🟢

## 1. États et cycle de vie

```
            create          start            stop/kill
 (image) ──────────▶ created ────▶ running ───────────▶ exited ──rm──▶ (supprimé)
                                    │  ▲                   │
                              pause │  │ unpause     restart (policy)
                                    ▼  │                   │
                                  paused                   ▼
                                                        running
```

| Commande | Effet |
|----------|-------|
| `docker create` | crée sans démarrer |
| `docker start` / `stop` / `restart` | démarre / arrête proprement / redémarre |
| `docker pause` / `unpause` | gèle (cgroup freezer) |
| `docker kill -s SIGHUP` | envoie un signal |
| `docker rm` / `docker rm -f` | supprime (le second tue d'abord) |
| `docker wait` | bloque jusqu'à la fin, renvoie le code |

### Arrêt propre : signaux

`docker stop` envoie **SIGTERM** au PID 1 du conteneur, attend 10 s (`--time`/`--stop-timeout`), puis **SIGKILL**.

> ⚠️ **Piège PID 1** : le noyau n'applique pas les actions par défaut des signaux au PID 1 d'un namespace. Si votre programme n'installe pas de handler SIGTERM, il ignorera `docker stop` et sera tué après 10 s (code 137). Solutions : gérer les signaux dans l'appli, utiliser la **forme exec** (`CMD ["node","app.js"]` et non `CMD node app.js`), ou `--init` (tini) :
> ```bash
> docker run --init -d …
> ```
> `--init` gère aussi la récolte des processus zombies.

## 2. Processus principal : ENTRYPOINT / CMD (aperçu)

L'image définit ce qui est exécuté :
- `ENTRYPOINT` : exécutable fixe,
- `CMD` : arguments/commande par défaut, remplaçables par `docker run IMAGE nouvelle-commande`.

Voir le module 05 pour le détail. Pour surcharger l'entrypoint : `docker run --entrypoint sh -it image`.

## 3. Variables d'environnement et configuration

```bash
docker run -e DB_HOST=db -e DB_PORT=5432 monapp
docker run --env-file .env monapp           # fichier KEY=VALUE, sans guillemets particuliers
docker run -e HOME monapp                   # transmet la valeur de l'hôte
```

Principe des 12 facteurs : **la configuration vient de l'environnement**, pas de l'image. Ne mettez jamais de secrets dans l'image ni dans les `ENV` du Dockerfile (visibles via `docker inspect` / `history`).

## 4. Publication de ports

```bash
-p 8080:80                  # hôte:conteneur, toutes interfaces
-p 127.0.0.1:8080:80        # uniquement local (recommandé en dev)
-p 8080:80/udp
-p 80                       # port hôte aléatoire
-P                          # publie tous les EXPOSE sur des ports aléatoires
docker port nom             # voir les correspondances
```

`EXPOSE` dans un Dockerfile est **documentaire** : il ne publie rien.

> ⚠️ Docker modifie `iptables` et **contourne souvent ufw/firewalld**. Un `-p 5432:5432` expose la base sur toutes les interfaces. Préférez `127.0.0.1:` ou un réseau interne.

## 5. Limiter les ressources (cgroups)

```bash
docker run -m 512m --memory-swap 512m  # RAM (et swap) max ; dépassement → OOM kill (137)
docker run --cpus 1.5                  # 1,5 CPU
docker run --cpu-shares 512            # poids relatif
docker run --pids-limit 100            # protège des fork bombs
docker run --ulimit nofile=1024:2048
docker run --blkio-weight 300
docker update --memory 1g --cpus 2 nom # modification à chaud
docker stats                           # CPU / RAM / réseau / I/O en direct
```

Toujours définir des limites en production : un conteneur sans limite peut affamer l'hôte.

## 6. Politiques de redémarrage

| Politique | Comportement |
|-----------|--------------|
| `no` (défaut) | jamais |
| `on-failure[:N]` | si code ≠ 0 (N tentatives max) |
| `always` | toujours (même après redémarrage du démon) |
| `unless-stopped` | comme `always` sauf si arrêté manuellement |

```bash
docker run -d --restart unless-stopped nginx
```

⚠️ Une politique de redémarrage ne remplace pas un orchestrateur ni un healthcheck.

## 7. Logs

```bash
docker logs nom
docker logs -f --since 10m --tail 50 -t nom      # suivre, filtrer, horodater
```

Docker capture **stdout/stderr** du PID 1. Bonne pratique : **loguer sur stdout/stderr**, jamais dans des fichiers à l'intérieur du conteneur.

Pilotes de logs (`--log-driver`) : `json-file` (défaut), `local`, `journald`, `syslog`, `fluentd`, `gelf`, `awslogs`…

⚠️ Le `json-file` **n'a pas de rotation par défaut** → disque plein ! Configurez :
```bash
docker run --log-opt max-size=10m --log-opt max-file=3 …
```
ou globalement dans `/etc/docker/daemon.json` :
```json
{ "log-driver": "local", "log-opts": { "max-size": "10m", "max-file": "3" } }
```

## 8. Interagir avec un conteneur

```bash
docker exec -it nom sh                # nouveau processus dans le conteneur
docker exec -u root -w /tmp nom id    # utilisateur et répertoire
docker attach nom                     # se rattacher au PID 1 (Ctrl+P Ctrl+Q pour quitter)
docker cp nom:/etc/nginx/nginx.conf .
docker diff nom                       # fichiers modifiés (A/C/D)
docker export nom > fs.tar            # système de fichiers à plat
docker events                         # flux d'événements du démon
```

## 9. Hostname, DNS, user, workdir, système de fichiers

```bash
docker run --hostname web01 --dns 1.1.1.1 --add-host db:10.0.0.5 …
docker run -u 1000:1000 -w /app …
docker run --read-only --tmpfs /tmp …     # FS racine en lecture seule
```

## 10. Healthcheck (aperçu)

```bash
docker run -d --name web \
  --health-cmd 'wget -qO- http://localhost/ || exit 1' \
  --health-interval 10s --health-retries 3 nginx:alpine
docker inspect -f '{{.State.Health.Status}}' web     # starting / healthy / unhealthy
```
Détaillé aux modules 09 et 12.

## 11. Dépannage rapide d'un conteneur qui s'arrête

1. `docker ps -a` : code de sortie ?
2. `docker logs nom` : message d'erreur.
3. `docker inspect -f '{{.State.OOMKilled}} {{.State.ExitCode}} {{.State.Error}}' nom`
4. Relancer avec un shell : `docker run -it --entrypoint sh image`.
5. Exécuter la commande d'origine à la main.

Codes : `0` OK · `1` erreur appli · `125` erreur Docker · `126` non exécutable · `127` introuvable · `137` SIGKILL/OOM · `139` segfault · `143` SIGTERM.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 05](../05-dockerfile/)
