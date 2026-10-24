# Démos — Module 05

Toutes les démos se font depuis `modules/05-dockerfile/`.

## Démo 1 — Naïf vs propre (10 min)
```bash
cd app-python
docker build -f Dockerfile.v1-naif -t flask:naif .
docker build -t flask:propre .
docker images flask
docker history flask:propre
docker run --rm flask:naif id          # root
docker run --rm flask:propre id        # uid=10001
```

## Démo 2 — Le cache en action (5 min)
```bash
echo "# modif" >> app.py
docker build -t flask:propre .         # seules les dernières couches sont rejouées
echo "requests==2.32.3" >> requirements.txt
docker build -t flask:propre .         # pip install rejoué
sed -i '$ d' requirements.txt app.py      # annule les deux ajouts
```

## Démo 3 — Shell form vs exec form (5 min)
```bash
cat > /tmp/Dockerfile.shell <<'EOF'
FROM alpine
CMD sleep 300
EOF
cat > /tmp/Dockerfile.exec <<'EOF'
FROM alpine
CMD ["sleep", "300"]
EOF
docker build -q -f /tmp/Dockerfile.shell -t t:shell /tmp
docker build -q -f /tmp/Dockerfile.exec  -t t:exec  /tmp
docker run -d --name a t:shell && docker exec a ps      # PID 1 = /bin/sh -c sleep 300
docker run -d --name b t:exec  && docker exec b ps      # PID 1 = sleep 300
docker rm -f a b
```

## Démo 4 — ENTRYPOINT + CMD (5 min)
```bash
cat > /tmp/Dockerfile.ep <<'EOF'
FROM alpine
ENTRYPOINT ["echo", "Bonjour"]
CMD ["monde"]
EOF
docker build -q -f /tmp/Dockerfile.ep -t t:ep /tmp
docker run --rm t:ep              # Bonjour monde
docker run --rm t:ep Awa          # Bonjour Awa
docker run --rm --entrypoint sh t:ep -c 'echo override'
```

## Démo 5 — `.dockerignore` et contexte (5 min)
```bash
mkdir -p /tmp/ctx && cd /tmp/ctx
dd if=/dev/zero of=gros.bin bs=1M count=200 2>/dev/null
echo "FROM alpine" > Dockerfile
DOCKER_BUILDKIT=0 docker build -t t:ctx . 2>&1 | head -3      # "Sending build context … 200MB"
echo gros.bin > .dockerignore
DOCKER_BUILDKIT=0 docker build -t t:ctx . 2>&1 | head -3      # quasi 0
```

## Démo 6 — Nettoyer dans la même couche (5 min)
```bash
cat > /tmp/Dockerfile.a <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
EOF
cat > /tmp/Dockerfile.b <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
EOF
docker build -q -f /tmp/Dockerfile.a -t t:a /tmp; docker build -q -f /tmp/Dockerfile.b -t t:b /tmp
docker images t
```

## Démo 7 — Node (5 min)
```bash
cd app-node && docker build -t node-demo . && docker run -d --name n -p 3000:3000 node-demo
curl localhost:3000 && time docker stop n && docker rm n
```
