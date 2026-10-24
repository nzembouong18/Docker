# Module 11 — Sécurité Docker

> **Durée** : 4 h · **Niveau** : 🟠 · Exemples : [`hardened/`](hardened/), [`seccomp-no-mkdir.json`](seccomp-no-mkdir.json).

## 1. Modèle de menace

Un conteneur n'est **pas** une frontière de sécurité aussi forte qu'une VM : il partage le noyau. La sécurité repose sur la **défense en profondeur** :

```
Hôte (OS à jour, durci) ─▶ Démon Docker (rootless / accès restreint)
   ─▶ Image (minimale, scannée, signée) ─▶ Runtime (non-root, capabilities, seccomp, FS RO)
   ─▶ Réseau (segmenté) ─▶ Secrets (jamais dans l'image) ─▶ Supply chain (CI, provenance)
```

Surfaces d'attaque : image vulnérable ou malveillante, secrets exposés, conteneur privilégié, socket Docker exposé, évasion via une faille noyau, réseau trop ouvert, dépendances compromises.

## 2. Le démon et son socket

- `/var/run/docker.sock` = **accès root** à l'hôte. Ne le montez jamais dans un conteneur applicatif, n'exposez jamais l'API TCP (2375) sans TLS mutuel (2376).
- Le groupe `docker` ≡ root. Limitez-le.
- Accès distant : **SSH** (`ssh://`) ou TLS client/serveur.
- **Rootless mode** : démon et conteneurs sans privilèges root.
  ```bash
  dockerd-rootless-setuptool.sh install
  export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
  ```
- **userns-remap** (`"userns-remap": "default"` dans `daemon.json`) : root du conteneur = utilisateur non privilégié de l'hôte.
- **live-restore**, journalisation d'audit (`auditd` sur `/var/lib/docker`, `/usr/bin/dockerd`).

## 3. Durcissement à l'exécution

### 3.1 Non-root
```dockerfile
USER 10001:10001
```
`docker run -u 10001:10001 …` en surcharge. Vérifiez : `docker exec c id`.

### 3.2 Capabilities Linux
Root se découpe en ~40 « capabilities ». Docker en donne 14 par défaut. **Retirez tout, ajoutez le minimum.**
```bash
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx
```
Dangereuses : `SYS_ADMIN` (quasi-root), `NET_ADMIN`, `SYS_PTRACE`, `DAC_OVERRIDE`. `--privileged` donne **tout** + accès aux périphériques : **proscrit** hors cas très spécifiques (DinD, outils bas niveau).

### 3.3 no-new-privileges
```bash
docker run --security-opt no-new-privileges:true …
```
Empêche l'élévation via setuid/setgid.

### 3.4 Système de fichiers en lecture seule
```bash
docker run --read-only --tmpfs /tmp …
```
Un attaquant ne peut plus déposer d'outils ni modifier le binaire.

### 3.5 seccomp, AppArmor, SELinux
- **seccomp** : filtre les appels système. Le profil par défaut de Docker bloque ~44 syscalls dangereux. Profil personnalisé :
  ```bash
  docker run --security-opt seccomp=seccomp-no-mkdir.json alpine mkdir /x   # Operation not permitted
  ```
  N'utilisez jamais `seccomp=unconfined`.
- **AppArmor** (Debian/Ubuntu) : profil `docker-default`.
- **SELinux** (RHEL/Fedora) : `--security-opt label=type:container_t`, étiquettes de volumes `:z/:Z`.

### 3.6 Limites de ressources
`--memory`, `--cpus`, `--pids-limit`, `--ulimit` : protègent contre DoS et fork bombs.

### 3.7 Réseau
Réseaux séparés/internes, ports publiés sur `127.0.0.1`, pas de `--network host` sans raison, `--icc=false` sur le bridge par défaut.

### Exemple combiné
```bash
docker run -d --name secure \
  --user 10001:10001 --read-only --tmpfs /tmp \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --pids-limit 100 --memory 128m --cpus 0.5 \
  -p 127.0.0.1:8080:8080 nginxinc/nginx-unprivileged:1.27-alpine
```
Voir [`hardened/compose.yaml`](hardened/compose.yaml).

## 4. Sécuriser les images

1. **Base minimale et officielle** (distroless, alpine, slim, Chainguard) ; moins de paquets = moins de CVE.
2. **Épingler** versions et digests ; mettre à jour régulièrement (Renovate/Dependabot).
3. **Multi-stage** : pas de compilateurs, pas de secrets de build dans l'image finale.
4. **Pas de secrets** dans `ENV`, `ARG`, `COPY` ; utiliser `--mount=type=secret`.
5. `.dockerignore` : exclure `.git`, `.env`, clés.
6. **Utilisateur non-root**, pas de `sudo`, pas de SSH dans l'image.
7. **Linter** : hadolint ; **audit** : `docker scout`, **Trivy**, **Grype**, **Snyk**.

### Scanner
```bash
docker scout quickview monimage:1.0
docker scout cves monimage:1.0
trivy image --severity HIGH,CRITICAL --ignore-unfixed monimage:1.0
trivy config .               # IaC: Dockerfile, compose, k8s
trivy fs --scanners secret . # secrets dans le code
grype monimage:1.0
```
Dans la CI : **bloquer** sur CRITICAL/HIGH corrigeables. Comprendre : une CVE n'est pas forcément exploitable (utilisez VEX / priorisez selon l'exposition).

## 5. Gestion des secrets

| Méthode | Avis |
|---------|------|
| Dans l'image / Dockerfile | ❌ jamais |
| Variables d'environnement (`-e`) | ⚠️ visibles via `inspect`, `/proc/<pid>/environ`, logs de crash |
| Fichiers montés (Compose `secrets:` → `/run/secrets/…`, tmpfs) | ✅ correct |
| Swarm/K8s secrets | ✅ chiffrés au repos (selon config) |
| Gestionnaire externe (Vault, AWS Secrets Manager, SOPS, 1Password) | ✅✅ rotation, audit |

Si un secret a fuité dans l'historique git ou une couche : **le révoquer** (le supprimer ne suffit pas).

## 6. Supply chain : confiance dans ce que l'on exécute

- **Docker Content Trust** (`DOCKER_CONTENT_TRUST=1`, Notary) — historique ; aujourd'hui on privilégie **Sigstore/cosign**.
- **Signer** : `cosign sign` (keyless via OIDC) ; **vérifier** avant déploiement (`cosign verify`, politiques Kyverno/Connaisseur côté Kubernetes).
- **SBOM** (SPDX/CycloneDX) : `docker buildx build --sbom=true`, `syft image`.
- **Provenance SLSA** : `--provenance=mode=max` ; build reproductible sur CI de confiance.
- Images de **confiance** : *Docker Official Images*, *Verified Publisher*, images durcies (Docker Hardened Images, Chainguard).
- Épinglez aussi vos actions CI par SHA, et limitez les permissions du `GITHUB_TOKEN`.

## 7. Benchmarks et outils d'audit

- **CIS Docker Benchmark** : `docker run --rm --net host --pid host -v /var/run/docker.sock:/var/run/docker.sock docker/docker-bench-security`
- **Falco** : détection d'anomalies runtime (shell dans un conteneur, écriture dans `/etc`).
- **Trivy / Grype / Scout** : vulnérabilités. **Dockle** : bonnes pratiques d'image.

## 8. Checklist de durcissement

- [ ] Image minimale, épinglée, scannée, signée
- [ ] `USER` non-root
- [ ] `--cap-drop ALL` + ajouts justifiés
- [ ] `no-new-privileges`, seccomp par défaut (jamais `unconfined`)
- [ ] FS en lecture seule + tmpfs ciblés
- [ ] Limites CPU/mémoire/PIDs
- [ ] Secrets en fichiers/gestionnaire, pas en ENV/image
- [ ] Pas de `--privileged`, pas de `docker.sock` monté
- [ ] Réseaux segmentés, ports minimaux liés à 127.0.0.1 si possible
- [ ] Démon rootless ou userns-remap ; hôte à jour
- [ ] Logs centralisés + détection runtime

## 9. Évasions de conteneur : comprendre pour mieux se protéger

Vecteurs historiques : `--privileged` (montage du disque hôte), `docker.sock` monté, `SYS_ADMIN` + cgroup `release_agent`, failles runc (CVE-2019-5736, CVE-2024-21626), noyau non patché. Atténuation : non-root, caps réduites, userns, seccomp/AppArmor, patchs, et si besoin **runtimes isolés** (gVisor `runsc`, Kata Containers, Firecracker).

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 12](../12-observabilite/)
