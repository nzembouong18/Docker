# Labos — Module 08

## Lab 8.1 — Architecture 3 tiers cloisonnée (40 min)
Construisez à la main (`docker network`/`docker run`) :
- réseau `frontend` et réseau `backend` (`--internal`),
- un conteneur `db` (postgres) **uniquement** sur `backend`,
- un conteneur `api` (image Flask du module 05, ou `http-echo`) sur `backend` **et** `frontend`,
- un conteneur `proxy` (nginx) sur `frontend`, seul à publier un port.

**Preuves à fournir** : `proxy` ne peut pas joindre `db` ; `db` n'a pas d'accès Internet ; `api` joint `db` par son nom ; l'hôte n'accède qu'au proxy.

## Lab 8.2 — Résolution DNS et alias (20 min)
Lancez 3 conteneurs avec l'alias `search` sur le même réseau. Appelez `nslookup search` et `getent hosts search` plusieurs fois : que constatez-vous ? Quelle utilisation pour un load balancing simple ?

## Lab 8.3 — Reverse proxy avec Compose (30 min)
Étendez [`proxy-demo`](proxy-demo/) : 3 réplicas d'un service (`docker compose up --scale app1=3`), nginx qui répartit la charge (résolution dynamique avec `resolver 127.0.0.11`), et un en-tête `X-Served-By`. Montrez la répartition avec une boucle `curl`.

## Lab 8.4 — Chasse aux pannes (30 min)
Pour chaque scénario, diagnostiquez et corrigez :
1. `docker run -d --name api flask-img` puis `docker run --rm alpine wget -qO- api:5000` échoue (nom inconnu).
2. L'app répond dans le conteneur (`curl localhost:5000`) mais pas depuis l'hôte avec `-p 5000:5000`.
3. `docker run -p 8080:80 nginx` : « port is already allocated ».
4. Un conteneur sur un réseau `--internal` doit joindre une API externe.

## Lab 8.5 — Macvlan ou ipvlan (optionnel, 20 min)
Donnez à un nginx une IP du LAN (macvlan) et accédez-y depuis une autre machine. Expliquez pourquoi l'hôte ne peut pas le joindre et comment contourner (interface macvlan sur l'hôte).

> Corrigés : [solutions.md](solutions.md)
