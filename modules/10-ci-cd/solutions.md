# Solutions — Module 10

## Lab 10.1
Reprendre [`workflows/build-push-ghcr.yml`](workflows/build-push-ghcr.yml) en retirant l'étape cosign si besoin. Pour rendre le paquet public : *Package settings → Change visibility*. Pensez à lier le paquet au dépôt (label `org.opencontainers.image.source`, ajouté par `metadata-action`).

## Lab 10.2
```yaml
- run: docker compose up -d --build --wait --wait-timeout 120
- run: |
    curl -fsS localhost:8080/health
    a=$(curl -fsS localhost:8080/ | jq .hits_redis); b=$(curl -fsS localhost:8080/ | jq .hits_redis)
    test "$b" -gt "$a"
    test "$(curl -s -o /dev/null -w '%{http_code}' localhost:8080/inconnu)" = 404
- if: failure()
  run: docker compose logs --no-color
- if: always()
  run: docker compose down -v
```

## Lab 10.3
```yaml
- uses: aquasecurity/trivy-action@0.28.0
  with: { image-ref: "ghcr.io/${{ github.repository }}@${{ steps.build.outputs.digest }}", severity: CRITICAL, exit-code: "1", ignore-unfixed: true }
```
Vérification : `cosign verify --certificate-identity-regexp '…' --certificate-oidc-issuer https://token.actions.githubusercontent.com IMAGE`.

## Lab 10.4
Typiquement 3-5 min sans cache → 30-60 s avec cache quand seules les sources changent. Le cache est invalidé par : modification d'une instruction, d'un fichier copié, de l'image de base, ou `--no-cache`.

## Lab 10.5
```bash
TAG=1.0.1 docker compose up -d --wait || TAG=1.0.0 docker compose up -d --wait
```
Meilleur : script `deploy.sh` qui mémorise le tag courant (`docker inspect -f '{{.Config.Image}}'`), déploie, attend `--wait`, puis revient en arrière en cas d'échec.

## Lab 10.6
```yaml
version: 2
updates:
  - package-ecosystem: docker
    directory: "/"
    schedule: { interval: weekly }
  - package-ecosystem: github-actions
    directory: "/"
    schedule: { interval: weekly }
```
