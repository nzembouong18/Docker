// Modules 05 à 09
module.exports = function (L) {
  const { pres, C, SHAPE, newSection, sectionSlide, slide, circleIcon, bullets, cards, code, callout, flow, table, stat, tag, box } = L;
  let s;

  // ===== 05 DOCKERFILE =====
  newSection("05 · Dockerfile");
  sectionSlide(5, "Écrire un Dockerfile", "Instructions, cache et bonnes pratiques", "Module 05 : environ 3 heures. Fichiers d'exemple : modules/05-dockerfile/app-python et app-node.");

  s = slide("Un Dockerfile, ligne par ligne", "Lire le Dockerfile de l'application Flask du dépôt. Chaque instruction crée une couche.");
  code(s, `FROM python:3.12-slim                     # image de base
ENV PYTHONUNBUFFERED=1                    # logs sans tampon
WORKDIR /app                              # dossier de travail

COPY requirements.txt .                   # 1) dépendances d'abord
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .                             # 2) puis le code

RUN useradd --system --uid 10001 appuser
USER appuser                              # 3) jamais root
EXPOSE 5000
HEALTHCHECK CMD python -c "import urllib.request as u; \\
  u.urlopen('http://localhost:5000/health')"
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]`, { x: 0.5, y: 1.3, w: 9, h: 3.1, fs: 11, label: "Dockerfile Flask" });
  callout(s, "key", "build : docker build -t flask:propre .  puis  docker run -d -p 5000:5000 flask:propre", { y: 4.5, h: 0.6, fs: 13 });

  s = slide("Les instructions essentielles", "ARG existe au build seulement, ENV persiste. COPY plutôt que ADD. Pas de secret dans ARG ni ENV.");
  table(s, [
    ["Instruction", "Rôle", "À retenir"],
    ["FROM", "Image de base", "Toujours un tag précis"],
    ["RUN", "Exécute au build", "Une couche par RUN"],
    ["COPY", "Copie du contexte", "Préférer à ADD"],
    ["ENV / ARG", "Variable run / build", "Pas de secrets"],
    ["USER", "Utilisateur", "Éviter root"],
    ["CMD / ENTRYPOINT", "Commande de démarrage", "Forme exec []"],
    ["HEALTHCHECK", "Test de santé", "Rapide et fiable"],
  ], { colW: [2.4, 3.0, 3.6], fs: 13 });

  s = slide("ENTRYPOINT et CMD", "ENTRYPOINT = exécutable fixe, CMD = arguments par défaut remplaçables. Montrer le tableau de combinaison avec la démo echo.");
  code(s, `FROM alpine
ENTRYPOINT ["echo", "Bonjour"]
CMD ["monde"]

$ docker run t:ep            # Bonjour monde
$ docker run t:ep Awa        # Bonjour Awa
$ docker run --entrypoint sh t:ep -c 'echo override'`, { x: 0.5, y: 1.3, w: 5.2, h: 2.7, fs: 11, label: "entrypoint" });
  table(s, [
    ["ENTRYPOINT", "CMD", "docker run img x y"],
    ["—", "[\"a\"]", "x y"],
    ["[\"e\"]", "—", "e x y"],
    ["[\"e\"]", "[\"a\"]", "e x y"],
  ], { x: 5.9, y: 1.3, w: 3.6, colW: [1.1, 0.9, 1.6], fs: 12 });
  callout(s, "tip", "patron courant : ENTRYPOINT = script d'initialisation qui termine par exec \"$@\" ; CMD = le serveur.", { y: 4.2, h: 0.8 });

  s = slide("Le cache : l'ordre fait tout", "Montrer en direct : modifier app.py et reconstruire. Seules les dernières couches sont rejouées (CACHED pour le reste).");
  code(s, `# ❌ chaque modification de code
#    réinstalle les dépendances
COPY . /app
RUN pip install -r requirements.txt`, { x: 0.5, y: 1.3, w: 4.4, h: 1.5, fs: 11, label: "mauvais ordre" });
  code(s, `# ✅ pip install rejoué seulement
#    si requirements.txt change
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .`, { x: 5.1, y: 1.3, w: 4.4, h: 1.5, fs: 11, label: "bon ordre" });
  tag(s, "Mauvais", 0.5, 2.95, 1.1, C.accent5); tag(s, "Bon", 5.1, 2.95, 0.8, C.accent3);
  bullets(s, [
    ["Règle d'or :", "ce qui change le moins en haut, ce qui change le plus en bas."],
    ["Invalidation :", "dès qu'une couche change, toutes les suivantes sont reconstruites."],
    ["Nettoyer dans la même couche :", "apt-get install … && rm -rf /var/lib/apt/lists/* (un rm ultérieur ne réduit pas l'image)."],
  ], { x: 0.5, y: 3.4, w: 9, h: 1.7, fontSize: 14, gap: 6 });

  s = slide("Les 8 bonnes pratiques d'or", "Servir de checklist pour relire n'importe quel Dockerfile. hadolint automatise une partie du contrôle.");
  cards(s, [
    { icon: "FaTag", color: C.accent1, title: "Base précise", text: "Image minimale, versionnée, officielle." },
    { icon: "FaLayerGroup", color: C.accent4, title: "Ordre cache", text: "Dépendances avant le code." },
    { icon: "FaUserShield", color: C.accent3, title: "Non-root", text: "USER numérique dédié." },
    { icon: "FaKey", color: C.accent5, title: "Sans secret", text: "Ni ARG, ni ENV, ni COPY." },
    { icon: "FaFilter", color: C.accent2, title: "Contexte", text: ".dockerignore : exclure .git, .env." },
    { icon: "FaTerminal", color: C.accent1, title: "Forme exec", text: "CMD [\"prog\", \"arg\"]." },
    { icon: "FaHeartbeat", color: C.accent4, title: "Healthcheck", text: "Sonde rapide, sans dépendance." },
    { icon: "FaCheckCircle", color: C.accent3, title: "hadolint", text: "Linter en CI." },
  ], { cols: 4, h: 1.55, y: 1.3, gap: 0.15, fs: 13, tfs: 14 });
  callout(s, "lab", "lab 5.2 : trouver les 8 défauts d'un Dockerfile volontairement mauvais.", { y: 4.68, h: 0.45, fs: 12 });

  // ===== 06 DOCKERFILE AVANCE =====
  newSection("06 · Dockerfile avancé");
  sectionSlide(6, "Dockerfile avancé", "Multi-stage, BuildKit, cache, multi-architecture", "Module 06 : environ 3 heures. Exemples : go-app et python-multistage.");

  s = slide("Multi-stage : build lourd, runtime léger", "Le compilateur reste dans l'étape build. Image finale distroless : pas de shell, utilisateur nonroot.");
  code(s, `FROM golang:1.22-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/app .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
ENTRYPOINT ["/app"]`, { x: 0.5, y: 1.3, w: 5.4, h: 2.4, fs: 11, label: "multi-stage" });
  stat(s, 6.2, 1.25, 1.6, "~850", "Mo, image mono-étape", C.accent5);
  stat(s, 7.9, 1.25, 1.6, "~10", "Mo, multi-stage", C.accent3);
  bullets(s, [
    "docker build --target build . : s'arrêter à une étape (debug, tests).",
    "COPY --from=nginx:alpine … : copier depuis une image externe.",
    "Pas de shell : déboguer avec docker debug ou nsenter.",
  ], { x: 0.5, y: 3.85, w: 9, h: 1.3, fontSize: 14, gap: 5 });

  s = slide("BuildKit : mounts de cache et secrets", "Le cache mount persiste hors de l'image. Le secret n'apparaît ni dans les couches ni dans history.");
  code(s, `# syntax=docker/dockerfile:1

# Cache persistant entre builds
RUN --mount=type=cache,target=/root/.cache/pip \\
    pip install -r requirements.txt

# Secret : jamais écrit dans l'image
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\
    npm ci

$ docker build --secret id=npmrc,src=$HOME/.npmrc .`, { x: 0.5, y: 1.3, w: 5.9, h: 3.1, fs: 11, label: "buildkit" });
  cards(s, [
    { icon: "FaBolt", color: C.accent2, title: "Cache mount", text: "pip, npm, apt, go : builds plus rapides." },
    { icon: "FaLock", color: C.accent3, title: "Secret mount", text: "Disponible pendant ce RUN seulement." },
  ], { cols: 1, x0: 6.6, w: 2.9, h: 1.3, y: 1.3, gap: 0.1, fs: 12, tfs: 14 });
  callout(s, "warn", "ARG et ENV laissent le secret dans docker history.", { x: 6.6, y: 4.15, w: 2.9, h: 0.8, fs: 12 });

  s = slide("Multi-architecture et cache distant", "Les runners CI sont éphémères : sans cache distant chaque build repart de zéro. buildx produit un manifest list.");
  code(s, `$ docker buildx create --name multi --use --bootstrap

$ docker buildx build \\
    --platform linux/amd64,linux/arm64 \\
    --cache-from type=registry,ref=ghcr.io/org/app:cache \\
    --cache-to   type=registry,ref=ghcr.io/org/app:cache,mode=max \\
    --sbom=true --provenance=mode=max \\
    -t ghcr.io/org/app:1.0 --push .

$ docker buildx imagetools inspect ghcr.io/org/app:1.0`, { x: 0.5, y: 1.3, w: 9, h: 2.4, fs: 11, label: "buildx" });
  cards(s, [
    { icon: "FaMicrochip", color: C.accent1, title: "Variables auto", text: "BUILDPLATFORM, TARGETOS, TARGETARCH." },
    { icon: "FaRoute", color: C.accent4, title: "Compilation croisée", text: "FROM --platform=$BUILDPLATFORM évite QEMU." },
    { icon: "FaFileAlt", color: C.accent3, title: "SBOM + provenance", text: "Inventaire et preuve de construction." },
  ], { cols: 3, h: 1.2, y: 3.85, gap: 0.2, fs: 12, tfs: 14 });

  s = slide("Images minimales : le choix", "Pour scratch, copier les certificats CA et tzdata, utiliser un UID numérique.");
  table(s, [
    ["Option", "Quand l'utiliser", "Compromis"],
    ["alpine", "Simple et petit", "musl peut surprendre"],
    ["debian-slim", "Meilleure compatibilité", "Un peu plus lourd"],
    ["distroless", "Production", "Pas de shell"],
    ["scratch", "Binaire statique", "Rien de plus : tout à copier"],
    ["Chainguard / DHI", "Images durcies, peu de CVE", "Souvent payantes"],
  ], { colW: [2.2, 3.6, 3.2], fs: 14 });
  callout(s, "lab", "labos 6.1 à 6.6 : Go multi-stage, front nginx, build lent à optimiser, secret, multi-arch, Bake.", { y: 4.35, h: 0.7, fs: 13 });

  // ===== 07 VOLUMES =====
  newSection("07 · Volumes et stockage");
  sectionSlide(7, "Volumes et gestion des données", "Persister, partager, sauvegarder", "Module 07 : environ 2 heures.");

  s = slide("Trois façons de stocker", "La couche inscriptible disparaît avec le conteneur. Volume pour la prod, bind mount pour le dev, tmpfs pour le sensible.");
  cards(s, [
    { icon: "FaDatabase", color: C.accent1, title: "Volume", text: "Géré par Docker. Bases de données, données applicatives. Recommandé en production." },
    { icon: "FaFolderOpen", color: C.accent2, title: "Bind mount", text: "Un dossier de l'hôte. Idéal pour le code source en développement." },
    { icon: "FaMemory", color: C.accent4, title: "tmpfs", text: "En mémoire vive, jamais sur disque. Secrets et fichiers temporaires." },
  ], { cols: 3, h: 2.4, y: 1.3 });
  code(s, `-v pgdata:/var/lib/postgresql/data     # volume nommé
-v "$PWD":/app:ro                     # bind mount en lecture seule
--tmpfs /tmp                          # tmpfs`, { x: 0.5, y: 3.9, w: 9, h: 1.0, fs: 11, label: "mounts" });

  s = slide("PostgreSQL qui survit", "Démo : créer des données, supprimer le conteneur, en relancer un avec le même volume. Les données sont là.");
  code(s, `$ docker run -d --name pg \\
    -v pgdata:/var/lib/postgresql/data \\
    -e POSTGRES_PASSWORD=x postgres:16-alpine
$ docker exec pg psql -U postgres \\
    -c "create table t(n int); insert into t values (1),(2);"
$ docker rm -f pg                         # le volume survit
$ docker run -d --name pg -v pgdata:/var/lib/postgresql/data \\
    -e POSTGRES_PASSWORD=x postgres:16-alpine
$ docker exec pg psql -U postgres -c "select * from t;"`, { x: 0.5, y: 1.3, w: 9, h: 2.6, fs: 11, label: "postgres volume" });
  bullets(s, [
    ["Volume vide :", "Docker y copie le contenu du dossier de l'image au premier montage."],
    ["Bind mount :", "masque le contenu de l'image à cet endroit."],
  ], { x: 0.5, y: 4.05, w: 9, h: 1.0, fontSize: 14, gap: 5 });

  s = slide("Sauvegarder et restaurer", "Un conteneur Alpine éphémère avec tar. Pour une base, préférer un dump logique cohérent.");
  code(s, `# Sauvegarde d'un volume
$ docker run --rm -v pgdata:/data:ro -v "$PWD":/backup alpine \\
    tar czf /backup/pgdata-$(date +%F).tar.gz -C /data .

# Restauration dans un nouveau volume
$ docker volume create pgdata-restore
$ docker run --rm -v pgdata-restore:/data -v "$PWD":/backup alpine \\
    tar xzf /backup/pgdata-2026-01-01.tar.gz -C /data

# Base de données : dump logique, plus sûr
$ docker exec pg pg_dump -U postgres formation > formation.sql`, { x: 0.5, y: 1.3, w: 9, h: 3.0, fs: 11, label: "backup" });
  callout(s, "warn", "copier à chaud les fichiers d'une base peut produire une sauvegarde corrompue.", { y: 4.45, h: 0.6 });

  s = slide("Permissions et pièges courants", "Les UID doivent correspondre. SELinux demande :z ou :Z. Les volumes anonymes s'accumulent.");
  table(s, [
    ["Symptôme", "Cause", "Solution"],
    ["permission denied", "UID du conteneur ≠ propriétaire", "chown dans l'image ou -u $(id -u):$(id -g)"],
    ["Fichiers créés en root", "Conteneur root + bind mount", "Utilisateur non-root"],
    ["Accès refusé (Fedora, RHEL)", "SELinux", "Suffixe :z ou :Z"],
    ["Volumes orphelins", "VOLUME anonyme", "docker volume ls -f dangling=true"],
  ], { colW: [2.4, 3.2, 3.4], fs: 13 });
  callout(s, "lab", "labos 7.1 à 7.5 : base persistante, scripts backup/restore, dev à chaud, partage, conteneur durci.", { y: 4.0, h: 0.8 });

  // ===== 08 RESEAU =====
  newSection("08 · Réseau");
  sectionSlide(8, "Le réseau Docker", "Bridge, DNS, publication de ports, reverse proxy", "Module 08 : environ 3 heures.");

  s = slide("Les pilotes réseau", "Chaque conteneur a son namespace réseau. Les pilotes relient ces namespaces.");
  table(s, [
    ["Pilote", "Description", "Usage"],
    ["bridge", "Réseau privé sur l'hôte (défaut)", "Conteneurs d'un même hôte"],
    ["host", "Partage la pile réseau de l'hôte", "Performance, outils réseau"],
    ["none", "Seulement loopback", "Isolation totale"],
    ["overlay", "Multi-hôtes (VXLAN)", "Swarm"],
    ["macvlan", "IP/MAC propres sur le LAN", "Intégration legacy"],
  ], { colW: [1.5, 4.0, 3.5], fs: 14 });

  s = slide("Bridge par défaut ou bridge utilisateur", "Le bridge par défaut n'a pas de DNS par nom. Toujours créer ses réseaux.");
  code(s, `$ docker network create app-net

$ docker run -d --name db --network app-net \\
    -e POSTGRES_PASSWORD=x postgres:16-alpine

$ docker run --rm --network app-net \\
    alpine ping -c1 db
# résolution par nom (DNS 127.0.0.11)`, { x: 0.5, y: 1.3, w: 5.3, h: 2.5, fs: 11, label: "réseau" });
  table(s, [
    ["", "bridge défaut", "bridge utilisateur"],
    ["DNS par nom", "❌", "✅"],
    ["Isolation", "Tout mélangé", "Par réseau"],
    ["Connexion à chaud", "Non", "Oui"],
  ], { x: 6.0, y: 1.3, w: 3.5, colW: [1.2, 1.1, 1.2], fs: 11 });
  callout(s, "key", "sur un même réseau, joignez db:5432 (nom et port interne), jamais localhost.", { y: 4.0, h: 0.75 });

  s = slide("Architecture cloisonnée à trois niveaux", "Seul le proxy est publié. La base n'est pas joignable depuis le proxy et n'a pas d'accès Internet (réseau internal).");
  box(s, { x: 0.5, y: 2.2, w: 1.9, h: 1.0, text: "Internet", fill: C.text1, fs: 15 });
  box(s, { x: 3.0, y: 2.2, w: 1.9, h: 1.0, text: "proxy (nginx)", fill: C.accent1, fs: 14 });
  box(s, { x: 5.4, y: 2.2, w: 1.7, h: 1.0, text: "api", fill: C.accent4, fs: 15 });
  box(s, { x: 7.6, y: 2.2, w: 1.9, h: 1.0, text: "db", fill: C.accent3, fs: 15 });
  [[2.45, "-p 8080"], [4.95, ""], [7.15, ""]].forEach(([ax]) => s.addShape(SHAPE.rightArrow, { x: ax, y: 2.58, w: 0.5, h: 0.25, fill: { color: C.text2 }, line: { color: C.text2, width: 0 } }));
  s.addText("réseau frontend", { x: 2.9, y: 1.7, w: 4.3, h: 0.35, fontSize: 14, bold: true, color: C.accent1, align: "center", margin: 0, isTextBox: true });
  s.addText("réseau backend (--internal)", { x: 5.3, y: 3.4, w: 4.3, h: 0.35, fontSize: 14, bold: true, color: C.accent3, align: "center", margin: 0, isTextBox: true });
  code(s, `$ docker network create frontend
$ docker network create --internal backend
$ docker network connect frontend api      # api sur les deux réseaux`, { x: 0.5, y: 3.95, w: 9, h: 0.95, fs: 11, label: "3 tiers" });

  s = slide("Publication de ports : les pièges", "Docker écrit dans iptables avant ufw. Une appli qui écoute sur 127.0.0.1 est injoignable depuis l'hôte.");
  table(s, [
    ["Symptôme", "Cause probable"],
    ["connection refused sur localhost", "l'appli écoute sur 127.0.0.1 au lieu de 0.0.0.0"],
    ["could not translate host name", "bridge par défaut ou réseaux différents"],
    ["port is already allocated", "un processus utilise déjà le port de l'hôte"],
    ["Port exposé malgré ufw", "Docker insère ses règles avant celles d'ufw"],
  ], { colW: [3.6, 5.4], fs: 14 });
  callout(s, "tip", "publiez sur 127.0.0.1 en dev, et faites passer la production par un seul reverse proxy.", { y: 4.0, h: 0.8 });

  s = slide("Diagnostiquer avec netshoot", "Le conteneur netshoot partage le namespace réseau du conteneur cible : tcpdump, dig, ss, curl sans modifier l'image.");
  code(s, `$ docker run -d --name web nginx:alpine
$ docker run --rm -it --network container:web nicolaka/netshoot
  # ss -tlnp ; curl localhost ; tcpdump -i eth0 -n port 80

$ docker exec web cat /etc/resolv.conf /etc/hosts
$ docker network inspect app-net \\
    --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\\n"}}{{end}}'`, { x: 0.5, y: 1.3, w: 9, h: 2.4, fs: 11, label: "netshoot" });
  callout(s, "lab", "labos 8.1 à 8.5 : trois niveaux cloisonnés, DNS et alias, reverse proxy, pannes, macvlan.", { y: 4.0, h: 0.8 });

  // ===== 09 COMPOSE =====
  newSection("09 · Docker Compose");
  sectionSlide(9, "Docker Compose", "Décrire et lancer une application multi-services", "Module 09 : environ 4 heures. La stack d'exemple est dans modules/09-compose/stack.");

  s = slide("Pourquoi Compose", "Montrer le contraste entre une page de docker run et un fichier YAML versionné.");
  cards(s, [
    { icon: "FaTerminal", color: C.accent5, title: "Sans Compose", text: "Plusieurs docker run interminables : fragile, difficile à relire, non reproductible." },
    { icon: "FaFileCode", color: C.accent3, title: "Avec Compose", text: "Un compose.yaml versionné décrit services, réseaux, volumes, secrets. Un seul up." },
  ], { cols: 2, h: 2.0, y: 1.3, gap: 0.3, fs: 15 });
  code(s, `$ docker compose up -d --build --wait    # tout démarrer
$ docker compose down                    # tout arrêter
$ docker compose down -v                 # + supprimer les volumes`, { x: 0.5, y: 3.55, w: 9, h: 1.0, fs: 12, label: "compose" });
  callout(s, "tip", "docker compose (v2, plugin) ; le champ version: est obsolète.", { y: 4.65, h: 0.5, fs: 13 });

  s = slide("Anatomie d'un compose.yaml", "Chaque service est joignable par son nom sur le réseau du projet.");
  code(s, `services:
  web:
    build: ./web
    environment: { DB_HOST: db }
    depends_on:
      db: { condition: service_healthy }
    networks: [front, back]
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    networks: [back]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
networks:
  front:
  back: { internal: true }
volumes:
  pgdata:`, { x: 0.5, y: 1.25, w: 5.7, h: 3.7, fs: 11, label: "compose" });
  cards(s, [
    { icon: "FaHeartbeat", color: C.accent3, title: "depends_on", text: "service_healthy attend vraiment que la base soit prête." },
    { icon: "FaNetworkWired", color: C.accent1, title: "Réseaux", text: "back est internal : pas d'accès sortant." },
    { icon: "FaDatabase", color: C.accent4, title: "Volume", text: "pgdata survit à docker compose down." },
  ], { cols: 1, x0: 6.4, w: 3.1, h: 1.22, y: 1.25, gap: 0.1, fs: 12, tfs: 14 });

  s = slide("Secrets, variables, profils, override", "Distinguer .env (interpolation), env_file (injecté dans le conteneur) et environment.");
  cards(s, [
    { icon: "FaKey", color: C.accent3, title: "Secrets", text: "secrets: monte un fichier dans /run/secrets. Postgres lit POSTGRES_PASSWORD_FILE." },
    { icon: "FaSlidersH", color: C.accent1, title: "Variables", text: "${VAR:-defaut}, ${VAR:?erreur}. Vérifier avec docker compose config." },
    { icon: "FaToggleOn", color: C.accent2, title: "Profils", text: "profiles: [debug] : services optionnels, démarrés à la demande." },
    { icon: "FaCopy", color: C.accent4, title: "Override", text: "compose.override.yaml appliqué en dev ; compose.prod.yaml avec -f." },
  ], { cols: 2, h: 1.45, y: 1.3, gap: 0.15, fs: 13, tfs: 15 });
  callout(s, "warn", "Postgres ne lit son mot de passe qu'à l'initialisation du volume : le changer après désynchronise l'appli.", { y: 4.4, h: 0.7, fs: 13 });

  s = slide("La stack d'exemple du dépôt", "Cette stack tourne réellement : vérifiée en session avec docker compose up --wait, scale web=3 et tests d'isolation.");
  s.addText("réseau front", { x: 0.5, y: 1.3, w: 4.0, h: 0.35, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText("réseau back (internal)", { x: 5.0, y: 1.3, w: 4.5, h: 0.35, fontSize: 14, bold: true, color: C.accent3, margin: 0, isTextBox: true });
  box(s, { x: 0.5, y: 1.8, w: 1.7, h: 0.8, text: "proxy nginx", fill: C.accent1, fs: 14 });
  box(s, { x: 2.8, y: 1.8, w: 1.7, h: 0.8, text: "web Flask", fill: C.accent4, fs: 14 });
  box(s, { x: 5.8, y: 1.8, w: 1.7, h: 0.8, text: "Postgres", fill: C.accent3, fs: 14 });
  box(s, { x: 7.8, y: 1.8, w: 1.7, h: 0.8, text: "Redis", fill: C.accent2, fs: 14 });
  box(s, { x: 5.8, y: 2.9, w: 3.7, h: 0.6, text: "adminer (profil debug)", fill: C.text1, fs: 14 });
  s.addShape(SHAPE.rightArrow, { x: 2.25, y: 2.07, w: 0.5, h: 0.26, fill: { color: C.text2 }, line: { color: C.text2, width: 0 } });
  s.addShape(SHAPE.rightArrow, { x: 4.55, y: 2.07, w: 1.2, h: 0.26, fill: { color: C.text2 }, line: { color: C.text2, width: 0 } });
  code(s, `$ cp secrets/db_password.txt.example secrets/db_password.txt
$ docker compose up -d --build --wait
$ curl localhost:8080       # {"hits_redis":1,"visits_postgres":1,...}`, { x: 0.5, y: 3.8, w: 9, h: 1.1, fs: 11, label: "stack" });

  s = slide("Commandes Compose essentielles", "docker compose watch pour le rechargement à chaud (sync, rebuild).");
  table(s, [
    ["Commande", "Action"],
    ["up -d [--build] [--wait]", "crée et démarre, attend les healthchecks"],
    ["down [-v]", "arrête, supprime (et les volumes avec -v)"],
    ["ps  ·  logs -f svc", "état et journaux"],
    ["exec svc sh  ·  run --rm svc cmd", "shell ou tâche ponctuelle"],
    ["up -d --scale web=3", "réplicas (sans container_name)"],
    ["config  ·  watch", "config finale validée ; hot reload"],
  ], { colW: [3.8, 5.2], fs: 13 });
  callout(s, "lab", "labos 9.1 à 9.6 : stack, votre application, migrations, profils, watch, validation en CI.", { y: 4.2, h: 0.8 });
};
