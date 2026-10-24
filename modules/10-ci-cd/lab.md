# Labos — Module 10

## Lab 10.1 — Votre premier pipeline (45 min)
1. Créez un dépôt GitHub avec l'API Flask du module 05.
2. Écrivez `.github/workflows/ci.yml` : lint (hadolint) → build → push vers GHCR (hors PR).
3. Tags attendus : `sha-xxxxxxx` sur chaque push, `1.0.0` et `1.0` sur un tag `v1.0.0`.
4. Rendez le paquet public et testez `docker run ghcr.io/<user>/<repo>:1.0.0`.

## Lab 10.2 — Tests d'intégration (40 min)
Ajoutez un job qui démarre la stack du module 09 avec `docker compose up -d --wait`, exécute 3 tests `curl` (santé, compteur qui s'incrémente, 404 sur une route inconnue) et affiche les logs en cas d'échec. Cassez volontairement un test pour vérifier l'affichage des logs.

## Lab 10.3 — Sécurité dans la chaîne (40 min)
1. Ajoutez Trivy avec `exit-code: 1` sur CRITICAL.
2. Provoquez un échec avec une vieille image de base (`python:3.8`), puis corrigez.
3. Ajoutez SBOM + provenance et vérifiez-les avec `docker buildx imagetools inspect`.
4. Signez avec cosign et vérifiez la signature.

## Lab 10.4 — Cache (25 min)
Mesurez le temps de build avec et sans `cache-from/to type=gha` (au moins 2 exécutions). Expliquez le gain observé et ce qui invalide le cache.

## Lab 10.5 — Déploiement et rollback (45 min)
Sur une VM (ou un Codespace), déployez via `docker compose pull && up -d` piloté par un tag. Simulez un mauvais déploiement (image qui plante, healthcheck KO) et revenez au tag précédent en moins de 2 minutes. Documentez la procédure.

## Lab 10.6 — Renovate/Dependabot (15 min)
Activez Dependabot pour `docker` et `github-actions` (`.github/dependabot.yml`). Observez la PR de mise à jour d'une image de base.

> Corrigés : [solutions.md](solutions.md)
