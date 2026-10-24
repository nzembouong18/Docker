# Module 00 — Prérequis : remise à niveau Linux, réseau et Git

> **Durée** : 1 h · **Niveau** : 🟢 · Si vous êtes à l'aise avec le shell Linux, passez directement au module 01 après le mini-test final.

Docker repose sur des **fonctionnalités du noyau Linux**. Comprendre un peu Linux évite 80 % des incompréhensions.

## 1. Le shell : les commandes indispensables

| Besoin | Commande | Exemple |
|--------|----------|---------|
| Où suis-je ? | `pwd` | `/home/user` |
| Lister | `ls -la` | fichiers cachés + droits |
| Naviguer | `cd` | `cd /etc` |
| Lire un fichier | `cat`, `less`, `head`, `tail -f` | `tail -f /var/log/syslog` |
| Chercher dans un texte | `grep` | `grep -i error app.log` |
| Chercher un fichier | `find` | `find . -name "*.yml"` |
| Redirections | `>`, `>>`, `\|`, `2>&1` | `ls \| wc -l` |
| Variables | `export VAR=val`, `$VAR` | `echo "$HOME"` |
| Processus | `ps aux`, `top`, `kill` | `ps aux \| grep nginx` |
| Droits | `chmod`, `chown` | `chmod +x script.sh` |
| Réseau | `curl`, `ss -tlnp`, `ping`, `dig` | `curl -I https://example.com` |

### Enchaîner des commandes

```bash
cmd1 && cmd2     # cmd2 seulement si cmd1 réussit
cmd1 || cmd2     # cmd2 seulement si cmd1 échoue
cmd1 ; cmd2      # toujours
echo $?          # code retour de la dernière commande (0 = succès)
```

> 💡 Un **code retour ≠ 0** signifie une erreur. Docker s'appuie énormément dessus (`docker run` renvoie le code de sortie du processus).

## 2. Processus, utilisateurs, droits

- Tout programme qui tourne est un **processus** avec un **PID**. Le PID 1 est le premier processus (`init`/`systemd`). **Dans un conteneur, votre application est le PID 1** — nous y reviendrons (signaux, zombies).
- Un utilisateur a un **UID** (`id`), `root` = UID 0. Par défaut un conteneur tourne en root : c'est un enjeu de sécurité (module 11).
- Les droits `rwx` (lecture/écriture/exécution) s'appliquent au propriétaire, au groupe, aux autres : `-rwxr-xr-- = 754`.

## 3. Système de fichiers

Linux a un seul arbre : `/`. Répertoires à connaître : `/etc` (config), `/var` (données variables, logs), `/usr` (programmes), `/tmp`, `/proc` & `/sys` (vues du noyau, fichiers « virtuels »), `/dev` (périphériques).

Les **montages** (`mount`) attachent un système de fichiers à un répertoire. Les volumes Docker sont des montages.

## 4. Réseau : l'essentiel

- **Adresse IP** (ex. `192.168.1.10`) + **masque** (`/24`) = un sous-réseau (CIDR).
- **Port** (0-65535) : identifie un service sur une machine (80 HTTP, 443 HTTPS, 22 SSH, 5432 PostgreSQL).
- **DNS** : traduit un nom en IP.
- **NAT** : traduit des adresses. Docker l'utilise pour exposer les conteneurs.
- **localhost / 127.0.0.1** : « cette machine ». **Dans un conteneur, localhost = le conteneur lui-même**, pas l'hôte — source classique d'erreurs.

## 5. Git (minimum vital)

```bash
git clone <url>
git status
git add . && git commit -m "message"
git push / git pull
git switch -c ma-branche
```

## 6. YAML (pour Compose, CI, Kubernetes)

```yaml
service:            # clé: valeur
  name: web
  ports:            # liste
    - "8080:80"
    - "8443:443"
  env:              # dictionnaire
    DEBUG: "true"
```

Règles : **indentation par espaces** (jamais de tabulations), `-` pour les listes, `#` pour commenter.

## 🧪 Mini-test (sans correction détaillée)

1. Que fait `ls | grep txt | wc -l` ?
2. Que vaut `$?` après `false` ?
3. Que signifie `chmod 640 f` ?
4. Dans un conteneur, qu'est-ce que `localhost` ?
5. Quel est le PID 1 dans un conteneur ?

<details><summary>Réponses</summary>

1. Compte les fichiers dont le nom contient « txt ».
2. `1` (échec).
3. Propriétaire `rw-`, groupe `r--`, autres `---`.
4. Le conteneur lui-même.
5. Le processus principal de l'application (`ENTRYPOINT`/`CMD`).
</details>

➡️ Suite : [Module 01 — Introduction](../01-introduction/)
