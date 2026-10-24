# Module 10 — Docker en CI/CD

> **Durée** : 3 h · **Niveau** : 🟠 · Workflows : [`workflows/`](workflows/).

## 1. La chaîne de livraison

```
 git push ─▶ CI: lint ─▶ build ─▶ tests ─▶ scan ─▶ push registry ─▶ CD: déploiement
                         (image)  (compose)  (CVE)   (tag + digest)    (compose / k8s)
```

Principe : **construire une seule fois, promouvoir la même image** (identifiée par son digest) de l'intégration à la production. On ne reconstruit jamais pour un autre environnement : seule la configuration change.

## 2. Stratégie de tags

| Tag | Exemple | Usage |
|-----|---------|-------|
| SHA du commit | `app:sha-3f2a1b9` | Traçabilité absolue, immuable |
| Version sémantique | `app:1.4.2`, `1.4`, `1` | Releases |
| Branche | `app:main`, `app:pr-42` | Environnements de test |
| `latest` | | À éviter pour déployer |

`docker/metadata-action` génère ces tags automatiquement.

## 3. Pipeline GitHub Actions pas à pas

Voir [`workflows/build-push-ghcr.yml`](workflows/build-push-ghcr.yml). Étapes clés :

1. `actions/checkout`.
2. `docker/setup-qemu-action` + `docker/setup-buildx-action` : multi-arch + BuildKit.
3. `docker/login-action` vers **GHCR** avec `GITHUB_TOKEN` (aucun secret à créer).
4. `docker/metadata-action` : tags & labels OCI.
5. `docker/build-push-action` : build, **cache GHA** (`type=gha`), push, SBOM, provenance.
6. **Trivy** : scan CVE, résultat SARIF dans l'onglet *Security*.
7. **cosign** : signature keyless (OIDC) de l'image par son digest.

**Permissions minimales** : déclarez `permissions:` explicitement (principe du moindre privilège).

### Cache de build en CI

Les runners sont éphémères : sans cache, chaque build repart de zéro.
- `cache-from/to: type=gha` (GitHub Actions cache),
- `type=registry,ref=…:buildcache` (portable, fonctionne partout),
- `type=local` (runner persistant).

## 4. Tester avec Docker

### 4.1 Tests unitaires dans une étape de build
```dockerfile
FROM builder AS test
RUN pytest -q
```
`docker build --target test .` échoue si les tests échouent.

### 4.2 Tests d'intégration avec Compose
Voir [`workflows/test-compose.yml`](workflows/test-compose.yml) : `docker compose up -d --wait` démarre la stack et attend les healthchecks ; on lance des *smoke tests* (`curl`), on affiche les logs en cas d'échec, puis `down -v`.

### 4.3 Testcontainers
Bibliothèque (Java, Go, Python, Node, .NET…) qui démarre des conteneurs **depuis les tests** (base, Kafka, Redis…), supprimés ensuite. Idéal pour les tests d'intégration sans compose manuel.

```python
# pip install testcontainers[postgres]
from testcontainers.postgres import PostgresContainer
def test_db():
    with PostgresContainer("postgres:16-alpine") as pg:
        url = pg.get_connection_url()
        ...
```

### 4.4 container-structure-test / goss
Vérifient le contenu d'une image (fichiers présents, commandes, métadonnées, utilisateur non-root).

## 5. Docker-in-Docker, DooD et alternatives

| Approche | Principe | Risque |
|----------|----------|--------|
| **DinD** (`docker:dind`) | Démon dédié dans un conteneur privilégié | `--privileged` |
| **DooD** | Monter `/var/run/docker.sock` de l'hôte | root sur l'hôte |
| **Runners VM éphémères** (GitHub-hosted) | Docker déjà installé | le plus simple |
| **Kaniko / BuildKit rootless / Buildah** | Build sans démon privilégié | support limité de certaines fonctions |

## 6. Déploiement (CD)

| Cible | Méthode |
|-------|---------|
| Serveur unique | SSH + `docker compose pull && up -d` ([`deploy-ssh.yml`](workflows/deploy-ssh.yml)), contexte Docker distant |
| Cluster Swarm | `docker stack deploy` |
| Kubernetes | Helm / Kustomize / GitOps (Argo CD, Flux) |
| PaaS | Cloud Run, ECS/Fargate, Azure Container Apps, Fly.io, Render… |

Stratégies : *rolling update*, *blue/green* (deux stacks + bascule du proxy), *canary*. Prévoyez un **rollback** : redéployer le tag/digest précédent.

Mise à jour automatique des dépendances d'images : **Renovate** ou **Dependabot** (`package-ecosystem: docker`).

## 7. Registres et rétention

- Politique de rétention (supprimer les images de branches anciennes).
- Tags **immuables** pour les releases (option du registre).
- Miroir/cache pour éviter les limites de Docker Hub (`registry-mirrors`, *pull-through cache*).

## 8. Checklist pipeline

- [ ] Lint Dockerfile (hadolint) & Compose (`config -q`)
- [ ] Build avec cache, multi-arch si nécessaire
- [ ] Tests (unitaires en stage, intégration avec Compose/Testcontainers)
- [ ] Scan CVE avec seuil bloquant (CRITICAL/HIGH)
- [ ] SBOM + provenance + signature
- [ ] Push avec tags SHA + semver
- [ ] Déploiement piloté par digest, avec healthcheck et rollback
- [ ] Secrets via le coffre de la CI, jamais dans le dépôt

➡️ [Démo](demo.md) · [Labo](lab.md) · [Quiz](quiz.md) · Suite : [Module 11](../11-securite/)
