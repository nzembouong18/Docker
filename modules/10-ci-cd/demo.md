# Démos — Module 10

## Démo 1 — Rejouer la CI en local (10 min)
```bash
docker run --rm -i hadolint/hadolint < modules/05-dockerfile/app-python/Dockerfile
docker compose -f modules/09-compose/stack/compose.yaml config -q && echo "compose valide"
docker build --target test modules/06-dockerfile-avance/python-multistage
```

## Démo 2 — Pipeline réel sur GitHub (15 min)
1. Copiez `workflows/build-push-ghcr.yml` dans `.github/workflows/` d'un dépôt qui contient un Dockerfile.
2. Poussez sur `main`, puis créez un tag `v0.1.0`.
3. Onglets **Actions** (logs), **Packages** (image GHCR), **Security** (résultats Trivy).
4. `docker pull ghcr.io/<user>/<repo>:0.1.0`.

## Démo 3 — Smoke test avec `--wait` (5 min)
```bash
cd modules/09-compose/stack && cp -n secrets/db_password.txt.example secrets/db_password.txt
docker compose up -d --build --wait --wait-timeout 120 && curl -fsS localhost:8080/health
docker compose down -v
```

## Démo 4 — Scanner et signer (10 min)
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.57.0 image --severity HIGH,CRITICAL python:3.12-slim
docker buildx imagetools inspect ghcr.io/<user>/<repo>:0.1.0 --format '{{json .Provenance}}'
cosign verify --certificate-identity-regexp 'https://github.com/<user>/<repo>/.*' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com ghcr.io/<user>/<repo>:0.1.0
```

## Démo 5 — Déploiement par contexte Docker distant (5 min)
```bash
docker context create prod --docker "host=ssh://deploy@serveur"
docker --context prod compose -f compose.yaml up -d
```
