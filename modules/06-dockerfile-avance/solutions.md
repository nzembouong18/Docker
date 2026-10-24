# Solutions — Module 06

## Lab 6.1
- `go:single` ≈ 850 Mo, `go:multi` ≈ 10 Mo (distroless/static ≈ 2 Mo + binaire 5 Mo).
- Avec `scratch` : copier `/etc/ssl/certs/ca-certificates.crt` si l'app fait du HTTPS sortant, `/usr/share/zoneinfo` pour les fuseaux, et définir `USER 10001:10001` (pas de `/etc/passwd`, donc un UID numérique).
- Distroless et scratch n'ont **pas de shell** : `exec sh` échoue. Pour déboguer : `docker debug`, `kubectl debug`, ou l'image `:debug-nonroot`.

## Lab 6.2
```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
```
`nginx.conf` :
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  location / { try_files $uri /index.html; }
}
```

## Lab 6.3
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app
RUN --mount=type=cache,target=/var/cache/apt --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y --no-install-recommends gcc
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```
Fautes d'origine : `COPY . /app` avant `pip install` (cache invalidé à chaque modif), `apt-get` après, image non slim, CMD en forme shell. Rebuild ≈ 1-2 s (seule la couche `COPY . .` est rejouée).

## Lab 6.4
```dockerfile
# syntax=docker/dockerfile:1
FROM alpine
RUN apk add --no-cache curl
RUN --mount=type=secret,id=api_token \
    curl -fsS -H "Authorization: Bearer $(cat /run/secrets/api_token)" https://exemple.test/fichier -o /data.bin
```
```bash
docker build --secret id=api_token,env=API_TOKEN -t t:s .
```
`grep` ne trouve rien : le secret n'est monté que dans un tmpfs pendant le `RUN`.

## Lab 6.5
```bash
docker run -d -p 5000:5000 --name registry registry:2
docker buildx build --platform linux/amd64,linux/arm64 --sbom=true --provenance=mode=max -t localhost:5000/go:1 --push go-app
docker buildx imagetools inspect localhost:5000/go:1
docker run --rm --platform linux/arm64 alpine uname -m      # aarch64
```

## Lab 6.6
```hcl
group "default" { targets = ["go", "py"] }
target "go" { context = "modules/06-dockerfile-avance/go-app"  tags = ["demo/go:bake"] }
target "py" { context = "modules/06-dockerfile-avance/python-multistage"  tags = ["demo/py:bake"] }
```
`docker buildx bake`
