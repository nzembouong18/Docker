#!/usr/bin/env bash
# Test de fumée de bout en bout via le proxy. Usage: scripts/smoke-test.sh [base_url]
set -euo pipefail
BASE=${1:-http://localhost:8080}

echo "→ santé";        curl -fsS "$BASE/health" >/dev/null
echo "→ création";     id=$(curl -fsS -X POST -H 'Content-Type: application/json' -d '{"title":"smoke"}' "$BASE/api/todos" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
echo "→ lecture";      curl -fsS "$BASE/api/todos" | grep -q smoke
echo "→ bascule";      curl -fsS -X PATCH "$BASE/api/todos/$id" | grep -q '"done":true'
echo "→ suppression";  test "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$BASE/api/todos/$id")" = 204
echo "→ validation";   test "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/api/todos")" = 400
echo "✅ OK"
