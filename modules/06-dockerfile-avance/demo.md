# Démos — Module 06

Depuis `modules/06-dockerfile-avance/`.

## Démo 1 — 850 Mo → 10 Mo (10 min)
```bash
docker build -f go-app/Dockerfile.single -t go:single go-app
docker build -t go:multi go-app
docker images go
docker run -d --name g -p 8080:8080 go:multi && curl localhost:8080
docker exec g sh           # échoue : distroless n'a pas de shell
docker stop g && docker rm g
```

## Démo 2 — Injecter la version à la compilation (3 min)
```bash
docker build --build-arg VERSION=1.2.3 -t go:1.2.3 go-app
docker run --rm -d -p 8081:8080 --name v go:1.2.3 && curl localhost:8081; docker rm -f v
```

## Démo 3 — Cache mounts (5 min)
```bash
cd python-multistage
docker build -t py:ms .             # 1er build : télécharge numpy
echo "# x" >> requirements.txt
docker build -t py:ms .             # réutilise ~/.cache/pip via le cache mount
docker run --rm py:ms
docker build --target test -t py:test .      # étape de tests
cd ..
```

## Démo 4 — Secret de build (5 min)
```bash
echo "token-super-secret" > /tmp/mon_secret
cat > /tmp/Dockerfile.secret <<'EOF'
# syntax=docker/dockerfile:1
FROM alpine
RUN --mount=type=secret,id=tok sh -c 'echo "longueur: $(wc -c < /run/secrets/tok)"'
EOF
docker build --progress=plain --secret id=tok,src=/tmp/mon_secret -f /tmp/Dockerfile.secret /tmp 2>&1 | grep longueur
docker build -q --secret id=tok,src=/tmp/mon_secret -f /tmp/Dockerfile.secret -t t:secret /tmp
docker history t:secret | grep -i token || echo "secret absent de l'historique ✅"
```

## Démo 5 — Comparer avec un secret dans ENV/ARG (3 min)
```bash
cat > /tmp/Dockerfile.leak <<'EOF'
FROM alpine
ARG TOKEN
ENV T2=$TOKEN
EOF
docker build -q --build-arg TOKEN=leak123 -f /tmp/Dockerfile.leak -t t:leak /tmp
docker history t:leak | grep leak123      # visible !
docker inspect -f '{{.Config.Env}}' t:leak
```

## Démo 6 — Multi-arch (10 min)
```bash
docker buildx create --name multi --use --bootstrap
docker buildx build --platform linux/amd64,linux/arm64 -t localhost:5000/go:multi go-app --push   # registre local requis
docker buildx imagetools inspect localhost:5000/go:multi
```
(Lancer avant : `docker run -d -p 5000:5000 --name registry registry:2`.)

## Démo 7 — Explorer avec dive (5 min)
```bash
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive go:single
```

## Démo 8 — Lint du Dockerfile (3 min)
```bash
docker build --check go-app
docker run --rm -i hadolint/hadolint < go-app/Dockerfile.single
```
