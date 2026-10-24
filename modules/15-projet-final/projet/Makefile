.PHONY: up down test logs smoke clean prod-config
up:        ; cp -n .env.example .env || true; docker compose up -d --build --wait
down:      ; docker compose down
test:      ; docker build --target test ./api
logs:      ; docker compose logs -f --tail=50
smoke:     ; ./scripts/smoke-test.sh
clean:     ; docker compose down -v --remove-orphans
prod-config: ; REGISTRY=ghcr.io/org TAG=1.0.0 POSTGRES_PASSWORD=x docker compose -f compose.yaml -f compose.prod.yaml config
