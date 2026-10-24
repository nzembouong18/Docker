#!/usr/bin/env bash
# Vérifie que l'environnement est prêt pour la formation.
set -u
ok=0; ko=0
check() {
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then echo "✅ $name"; ok=$((ok+1)); else echo "❌ $name"; ko=$((ko+1)); fi
}
check "docker installé"            command -v docker
check "daemon Docker accessible"   docker info
check "plugin compose v2"          docker compose version
check "buildx"                     docker buildx version
check "git installé"               command -v git
check "curl installé"              command -v curl
check "accès Docker Hub"           docker pull hello-world
echo "----"; echo "$ok OK, $ko KO"
[ "$ko" -eq 0 ]
