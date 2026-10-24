# Module 05 — Écrire un Dockerfile

> **Durée** : 3 h · **Niveau** : 🟡 · Fichiers d'exemple : [`app-python/`](app-python/) et [`app-node/`](app-node/).

## 1. Principe

Un **Dockerfile** est un fichier texte listant des instructions. `docker build` les exécute **dans l'ordre** ; la plupart créent une **couche**.

```bash
docker build -t monapp:1.0 .          # '.' = contexte de build
docker build -f Dockerfile.dev -t monapp:dev .
```

Le **contexte** (le dossier `.`) est envoyé au démon. Tout fichier qui s'y trouve peut être `COPY`é. D'où l'importance du `.dockerignore`.

## 2. Les instructions

| Instruction | Rôle | Remarques |
|-------------|------|-----------|
| `FROM image[:tag]` | image de base | première instruction (hors `ARG`). `FROM scratch` = vide |
| `WORKDIR /app` | répertoire courant | le crée s'il n'existe pas ; préférez-le à `RUN cd` |
| `COPY src dest` | copie depuis le contexte | `--chown=user:group`, `--chmod` |
| `ADD src dest` | comme COPY + URL + extraction tar | préférez `COPY` |
| `RUN cmd` | exécute pendant le **build** | une couche par `RUN` |
| `ENV K=V` | variable d'environnement (build **et** run) | persiste dans l'image |
| `ARG K=V` | variable **de build** uniquement | `--build-arg K=V` |
| `EXPOSE 8080` | documente un port | ne publie pas |
| `USER name` | utilisateur pour la suite | indispensable : évitez root |
| `VOLUME /data` | déclare un point de montage | à utiliser avec parcimonie |
| `ENTRYPOINT [...]` | exécutable principal | |
| `CMD [...]` | commande/arguments par défaut | |
| `HEALTHCHECK` | test de santé | |
| `LABEL k=v` | métadonnées (OCI) | `org.opencontainers.image.*` |
| `STOPSIGNAL` | signal d'arrêt | |
| `SHELL` | shell des instructions *shell form* | |
| `ONBUILD` | déclencheur pour images enfants | rare |

### Forme *shell* vs forme *exec*

```dockerfile
CMD node server.js            # shell form: /bin/sh -c "node server.js" → sh est PID 1 ❌ (signaux)
CMD ["node", "server.js"]     # exec form: node est PID 1 ✅
```

Utilisez **toujours la forme exec** pour `CMD`/`ENTRYPOINT`. (Pas d'expansion de variables en forme exec : utilisez `sh -c` ou un script avec `exec "$@"`.)

### ENTRYPOINT + CMD

| ENTRYPOINT | CMD | `docker run img` | `docker run img x y` |
|-----------|-----|------------------|----------------------|
| — | `["a"]` | `a` | `x y` (remplace) |
| `["e"]` | — | `e` | `e x y` |
| `["e"]` | `["a"]` | `e a` | `e x y` |

Patron courant : `ENTRYPOINT ["entrypoint.sh"]` + `CMD ["serveur"]`, et le script termine par `exec "$@"`.

### ARG vs ENV

```dockerfile
ARG PYTHON_VERSION=3.12          # avant FROM : utilisable dans FROM
FROM python:${PYTHON_VERSION}-slim
ARG APP_VERSION                   # après FROM : nouvelle déclaration
ENV APP_VERSION=${APP_VERSION}    # persiste à l'exécution
```
> ⚠️ N'utilisez ni `ARG` ni `ENV` pour des secrets (visibles dans `docker history`). Voir `RUN --mount=type=secret` (module 06).

### COPY vs ADD

`COPY` est explicite et prévisible. N'utilisez `ADD` que pour extraire automatiquement une archive locale. Pour télécharger : `RUN curl … | tar` ou `ADD --checksum=sha256:… URL`.

## 3. Comment fonctionne le cache

Pour chaque instruction, BuildKit calcule une clé (instruction + contenu des fichiers copiés + couche parente). Si elle est déjà connue → **cache hit**. Dès qu'une couche est invalidée, **toutes les suivantes** le sont.

⇒ **Règle d'or : placez ce qui change le moins en haut, ce qui change le plus en bas.**

```dockerfile
# ❌ chaque modification de code réinstalle toutes les dépendances
COPY . /app
RUN pip install -r requirements.txt

# ✅ les dépendances ne sont réinstallées que si requirements.txt change
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

## 4. `.dockerignore`

Même syntaxe que `.gitignore`. Il réduit le contexte (build plus rapide), évite de copier des secrets (`.env`, `.git`) et préserve le cache.

```
.git
node_modules
__pycache__/
*.log
.env
Dockerfile*
```

## 5. Bonnes pratiques

1. **Image de base minimale, versionnée** (`python:3.12-slim`, pas `python`).
2. **Combiner les commandes liées** dans un `RUN` et **nettoyer dans la même couche** :
   ```dockerfile
   RUN apt-get update && apt-get install -y --no-install-recommends curl \
       && rm -rf /var/lib/apt/lists/*
   ```
   (supprimer dans un `RUN` ultérieur ne réduit pas l'image : la couche précédente existe toujours).
3. **Un processus par conteneur**, logs sur stdout.
4. **Utilisateur non-root** (`USER`).
5. **Ordre pour le cache** (dépendances avant le code).
6. **Un seul `CMD`/`ENTRYPOINT` en forme exec**.
7. **Pas de secrets**, pas de `latest`.
8. **Multi-stage** pour séparer build et runtime (module 06).
9. **Healthcheck** + **labels**.
10. Lintez avec **hadolint** : `docker run --rm -i hadolint/hadolint < Dockerfile`.

## 6. Pas à pas : conteneuriser une application Flask

Voir [`app-python/`](app-python/).

```bash
cd modules/05-dockerfile/app-python
docker build -f Dockerfile.v1-naif -t flask:naif .
docker build -t flask:propre .
docker images | grep flask             # comparer les tailles
docker run -d --name flask -p 5000:5000 flask:propre
curl localhost:5000 ; curl localhost:5000/health
docker inspect -f '{{.State.Health.Status}}' flask
docker stop flask                       # rapide grâce à la forme exec
```

Observer le cache : modifiez `app.py` et reconstruisez ; seules les couches `COPY app.py` et suivantes sont reconstruites (`CACHED` pour les autres).

## 7. Variables d'environnement à l'exécution & entrypoint script

```bash
#!/bin/sh
# entrypoint.sh
set -e
echo "Démarrage en mode ${APP_ENV:-dev}"
# préparation (migrations, génération de config…)
exec "$@"        # remplace le shell par la commande: elle devient PID 1
```

```dockerfile
COPY --chmod=755 entrypoint.sh /usr/local/bin/
ENTRYPOINT ["entrypoint.sh"]
CMD ["gunicorn", "app:app"]
```

## 8. À retenir

- Dockerfile = recette versionnée, reproductible.
- Chaque instruction = une couche ; **l'ordre gouverne le cache**.
- Forme exec, non-root, `.dockerignore`, image minimale, pas de secrets.

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 06](../06-dockerfile-avance/)
