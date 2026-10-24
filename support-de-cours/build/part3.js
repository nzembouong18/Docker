// Modules 10 à 15 + conclusion
module.exports = function (L) {
  const { pres, C, SHAPE, AUTHOR, AUTHOR_ROLE, newSection, titleSlide, sectionSlide, slide, circleIcon, bullets, cards, code, callout, flow, table, stat, tag, box } = L;
  let s;

  // ===== 10 CI/CD =====
  newSection("10 · CI/CD");
  sectionSlide(10, "Docker en CI/CD", "Construire une fois, promouvoir la même image", "Module 10 : environ 3 heures. Workflows dans modules/10-ci-cd/workflows.");

  s = slide("La chaîne de livraison", "Principe : la même image, identifiée par son digest, traverse tous les environnements. Seule la configuration change.");
  flow(s, ["Lint", "Build", "Tests", "Scan CVE", "Push", "Déploiement"], {
    y: 1.5, h: 0.8, fs: 13, colors: [C.accent1, C.accent4, C.accent3, C.accent5, C.accent2, C.accent1],
    sub: ["hadolint, compose config", "BuildKit + cache", "stage test, compose --wait", "Trivy, seuil bloquant", "tags SHA + semver", "pull + up -d, rollback"],
  });
  callout(s, "key", "construire une seule fois ; ne jamais reconstruire pour un autre environnement.", { y: 4.1, h: 0.8 });

  s = slide("Stratégie de tags", "Le SHA donne la traçabilité absolue, le semver aide les humains. Éviter latest pour déployer.");
  table(s, [
    ["Tag", "Exemple", "Usage"],
    ["SHA du commit", "app:sha-3f2a1b9", "Traçabilité immuable"],
    ["Semver", "app:1.4.2 · 1.4 · 1", "Releases"],
    ["Branche / PR", "app:main · app:pr-42", "Environnements de test"],
    ["latest", "app:latest", "À éviter pour déployer"],
  ], { colW: [2.2, 3.4, 3.4], fs: 14 });
  callout(s, "tip", "docker/metadata-action génère ces tags automatiquement dans GitHub Actions.", { y: 3.9, h: 0.7 });

  s = slide("Pipeline GitHub Actions", "Permissions minimales, cache GHA, SBOM et provenance. Le scan Trivy vise le digest de l'image construite.");
  code(s, `permissions: { contents: read, packages: write, id-token: write }
steps:
  - uses: docker/setup-buildx-action@v3
  - uses: docker/login-action@v3
    with: { registry: ghcr.io, username: "\${{ github.actor }}",
            password: "\${{ secrets.GITHUB_TOKEN }}" }
  - uses: docker/metadata-action@v5          # tags + labels OCI
    id: meta
    with: { images: ghcr.io/\${{ github.repository }} }
  - uses: docker/build-push-action@v6
    id: build
    with: { push: true, tags: "\${{ steps.meta.outputs.tags }}",
            platforms: "linux/amd64,linux/arm64",
            cache-from: type=gha, cache-to: "type=gha,mode=max",
            sbom: true, provenance: mode=max }
  - uses: aquasecurity/trivy-action@0.28.0
    with: { image-ref: "...@\${{ steps.build.outputs.digest }}",
            severity: CRITICAL, exit-code: "1" }`, { x: 0.5, y: 1.25, w: 9, h: 3.7, fs: 10, label: "GitHub Actions" });

  s = slide("Tests d'intégration avec Compose", "docker compose up --wait attend les healthchecks. Toujours afficher les logs en cas d'échec et nettoyer avec if: always().");
  code(s, `- run: docker compose up -d --build --wait --wait-timeout 120
- run: ./scripts/smoke-test.sh          # curl : santé, CRUD, validation
- if: failure()
  run: docker compose logs --no-color
- if: always()
  run: docker compose down -v`, { x: 0.5, y: 1.25, w: 9, h: 1.6, fs: 12, label: "intégration" });
  cards(s, [
    { icon: "FaVial", color: C.accent3, title: "Stage test", text: "RUN python -m pytest -q : pas de tests verts, pas d'image." },
    { icon: "FaBoxes", color: C.accent4, title: "Testcontainers", text: "Démarrer des dépendances réelles depuis les tests." },
  ], { cols: 2, h: 1.4, y: 3.0, gap: 0.2, fs: 13, tfs: 15 });
  callout(s, "warn", "incident réel de ce dépôt : pytest seul ne trouvait pas le module app ; corrigé avec python -m pytest.", { y: 4.55, h: 0.55, fs: 12 });

  s = slide("Déployer et revenir en arrière", "Le rollback est un redéploiement du tag ou digest précédent. Documenter et répéter la procédure.");
  table(s, [
    ["Cible", "Méthode"],
    ["Serveur unique", "SSH + docker compose pull && up -d --wait"],
    ["Swarm", "docker stack deploy"],
    ["Kubernetes", "Helm, Kustomize, GitOps (Argo CD, Flux)"],
    ["Serverless conteneurs", "Cloud Run, ECS Fargate, Azure Container Apps"],
  ], { colW: [2.8, 6.2], fs: 14 });
  callout(s, "key", "rollback = TAG=<version précédente> docker compose up -d --wait.", { y: 3.9, h: 0.7 });

  // ===== 11 SECURITE =====
  newSection("11 · Sécurité");
  sectionSlide(11, "Sécurité Docker", "Défense en profondeur, du démon à la chaîne d'approvisionnement", "Module 11 : environ 4 heures.");

  s = slide("La défense en profondeur", "Un conteneur partage le noyau : une seule barrière ne suffit pas. Empiler les protections.");
  const lay = [["Hôte à jour et durci", C.text1], ["Démon : rootless, socket protégé", C.accent4], ["Image : minimale, scannée, signée", C.accent1], ["Runtime : non-root, capabilities, seccomp, FS RO", C.accent3], ["Réseau segmenté · Secrets hors image", C.accent2]];
  lay.forEach(([t2, col], i) => box(s, { x: 0.5 + i * 0.35, y: 1.35 + i * 0.72, w: 9 - i * 0.7, h: 0.62, text: t2, fill: col, fs: 14 }));

  s = slide("Les deux erreurs qui coûtent cher", "Démo possible : lire /etc/shadow de l'hôte depuis un conteneur ayant le socket. À ne faire que sur une machine de formation.");
  cards(s, [
    { icon: "FaSkullCrossbones", color: C.accent5, title: "docker.sock monté", text: "Le conteneur contrôle le démon : il peut lancer un conteneur qui monte / de l'hôte. Équivaut à root sur l'hôte." },
    { icon: "FaUnlock", color: C.accent5, title: "--privileged", text: "Presque toutes les protections désactivées et périphériques de l'hôte exposés. À proscrire." },
  ], { cols: 2, h: 2.2, y: 1.3, gap: 0.3, fs: 15 });
  callout(s, "warn", "ne jamais exposer l'API TCP 2375 sans TLS mutuel ; accès distant par SSH.", { y: 3.8, h: 0.8 });

  s = slide("Durcir à l'exécution", "Combiner tous les mécanismes : le fichier modules/11-securite/hardened/compose.yaml les réunit.");
  code(s, `$ docker run -d --name secure \\
    --user 10001:10001 \\
    --read-only --tmpfs /tmp \\
    --cap-drop ALL \\
    --security-opt no-new-privileges:true \\
    --pids-limit 100 --memory 128m --cpus 0.5 \\
    -p 127.0.0.1:8080:8080 \\
    nginxinc/nginx-unprivileged:1.27-alpine`, { x: 0.5, y: 1.3, w: 5.3, h: 3.0, fs: 11, label: "durcissement" });
  table(s, [
    ["Mécanisme", "Effet"],
    ["--user", "pas de root"],
    ["--read-only", "FS non modifiable"],
    ["--cap-drop ALL", "aucune capability"],
    ["no-new-privileges", "pas d'élévation setuid"],
    ["--pids-limit", "anti fork-bomb"],
  ], { x: 6.0, y: 1.3, w: 3.5, colW: [1.7, 1.8], fs: 11 });
  callout(s, "key", "vérifié en session : uid 101, « Read-only file system », CapDrop=[ALL].", { y: 4.45, h: 0.6, fs: 13 });

  s = slide("Sécuriser la chaîne d'approvisionnement", "Scanner, produire un SBOM, signer, vérifier avant de déployer.");
  flow(s, ["Image minimale", "Scan Trivy", "SBOM + provenance", "Signature cosign", "Vérification"], {
    y: 1.5, h: 0.9, fs: 13, colors: [C.accent1, C.accent5, C.accent4, C.accent3, C.accent2],
    sub: ["distroless, slim, digest figé", "CRITICAL/HIGH bloquants", "inventaire des composants", "keyless via OIDC", "cosign verify avant déploiement"],
  });
  code(s, `$ trivy image --severity HIGH,CRITICAL --ignore-unfixed monimage:1.0
$ trivy image --scanners secret monimage:1.0
$ cosign verify --certificate-identity-regexp '...' IMAGE`, { x: 0.5, y: 3.7, w: 9, h: 1.0, fs: 11, label: "scan" });

  s = slide("Gérer les secrets", "Si un secret a fuité dans une couche ou dans git, le révoquer : le supprimer ne suffit pas.");
  table(s, [
    ["Méthode", "Avis"],
    ["Dans l'image ou le Dockerfile", "❌ jamais"],
    ["Variable d'environnement (-e)", "⚠️ visible via inspect et /proc/<pid>/environ"],
    ["Fichier monté (secrets: → /run/secrets)", "✅ correct"],
    ["Gestionnaire externe (Vault, SOPS, cloud)", "✅✅ rotation et audit"],
  ], { colW: [4.4, 4.6], fs: 14 });
  callout(s, "lab", "11.4 : retrouver un secret dans une image avec history, save et Trivy, puis corriger avec --mount=type=secret.", { y: 3.9, h: 0.9, fs: 13 });

  // ===== 12 OBSERVABILITE =====
  newSection("12 · Observabilité");
  sectionSlide(12, "Observabilité", "Logs, métriques, santé et alertes", "Module 12 : environ 3 heures. Stack d'exemple dans modules/12-observabilite/monitoring.");

  s = slide("Les trois piliers", "Les logs disent ce qui s'est passé, les métriques l'état, les traces où le temps est perdu.");
  cards(s, [
    { icon: "FaFileAlt", color: C.accent1, title: "Logs", text: "Que s'est-il passé ? docker logs, Loki, ELK, Fluent Bit." },
    { icon: "FaChartLine", color: C.accent3, title: "Métriques", text: "Quel est l'état ? cAdvisor, Prometheus, Grafana." },
    { icon: "FaProjectDiagram", color: C.accent4, title: "Traces", text: "Où est le temps ? OpenTelemetry, Jaeger, Tempo." },
  ], { cols: 3, h: 2.3, y: 1.3 });
  callout(s, "key", "ajouter les healthchecks pour l'état et docker events pour le cycle de vie.", { y: 3.9, h: 0.7 });

  s = slide("Healthchecks : liveness et readiness", "Docker ne redémarre pas un conteneur unhealthy ; Swarm et Kubernetes le font.");
  code(s, `healthcheck:
  test: ["CMD", "curl", "-f", "localhost:8080/ready"]
  interval: 30s
  timeout: 3s
  start_period: 20s     # délai de grâce au démarrage
  retries: 3

$ docker inspect -f '{{json .State.Health}}' nom | jq`, { x: 0.5, y: 1.3, w: 5.5, h: 2.7, fs: 11, label: "healthcheck" });
  cards(s, [
    { icon: "FaHeartbeat", color: C.accent3, title: "/live", text: "Le processus répond." },
    { icon: "FaCheckCircle", color: C.accent1, title: "/ready", text: "Base et cache joignables." },
  ], { cols: 1, x0: 6.2, w: 3.3, h: 1.25, y: 1.3, gap: 0.15, fs: 13, tfs: 15 });
  callout(s, "tip", "mesuré dans le projet final : base arrêtée, /health répond 503 ; redémarrée, retour à healthy.", { y: 4.2, h: 0.8, fs: 13 });

  s = slide("Stack Prometheus, Grafana et Loki", "cAdvisor lit les cgroups, Prometheus collecte, Grafana affiche. Promtail envoie les logs vers Loki.");
  box(s, { x: 0.5, y: 1.5, w: 1.8, h: 0.8, text: "Conteneurs", fill: C.text1, fs: 14 });
  box(s, { x: 2.9, y: 1.2, w: 1.8, h: 0.7, text: "cAdvisor", fill: C.accent1, fs: 14 });
  box(s, { x: 2.9, y: 2.2, w: 1.8, h: 0.7, text: "Promtail", fill: C.accent4, fs: 14 });
  box(s, { x: 5.3, y: 1.2, w: 1.8, h: 0.7, text: "Prometheus", fill: C.accent2, fs: 14 });
  box(s, { x: 5.3, y: 2.2, w: 1.8, h: 0.7, text: "Loki", fill: C.accent4, fs: 14 });
  box(s, { x: 7.7, y: 1.7, w: 1.8, h: 0.8, text: "Grafana", fill: C.accent3, fs: 15 });
  [[2.35, 1.45], [2.35, 2.45], [4.75, 1.35], [4.75, 2.35], [7.15, 1.75], [7.15, 2.25]].forEach(([ax, ay]) => s.addShape(SHAPE.rightArrow, { x: ax, y: ay, w: 0.5, h: 0.2, fill: { color: C.text2 }, line: { color: C.text2, width: 0 } }));
  code(s, `rate(container_cpu_usage_seconds_total{name!=""}[1m])        # CPU par conteneur
container_memory_working_set_bytes{name="demo-web"}           # mémoire
{service="web"} |= "error"                                    # LogQL (Loki)`, { x: 0.5, y: 3.3, w: 9, h: 0.95, fs: 10.5, label: "requêtes" });
  callout(s, "lab", "modules/12-observabilite/monitoring : docker compose up -d, puis Grafana sur 127.0.0.1:3000.", { y: 4.4, h: 0.65, fs: 13 });

  s = slide("Que faut-il surveiller", "Alerter sur les symptômes (latence, erreurs) autant que sur les ressources.");
  table(s, [
    ["Signal", "Exemple d'alerte"],
    ["Santé", "conteneurs unhealthy, redémarrages répétés"],
    ["Mémoire", "usage > 90 % de la limite pendant 5 min, événement oom"],
    ["CPU", "throttling élevé même sans saturation"],
    ["Disque", "/var/lib/docker, logs sans rotation"],
    ["Application", "taux d'erreurs, latence p95 (méthode RED)"],
  ], { colW: [2.2, 6.8], fs: 14 });

  // ===== 13 ORCHESTRATION =====
  newSection("13 · Orchestration");
  sectionSlide(13, "Orchestration", "Docker Swarm puis passage à Kubernetes", "Module 13 : environ 4 heures. Fichiers : modules/13-orchestration/swarm et k8s.");

  s = slide("Pourquoi orchestrer", "Un orchestrateur transforme un état désiré en actions, dans une boucle de réconciliation permanente.");
  cards(s, [
    { icon: "FaServer", color: C.accent1, title: "Plusieurs hôtes", text: "Capacité et tolérance aux pannes." },
    { icon: "FaSyncAlt", color: C.accent3, title: "Auto-guérison", text: "Redémarrer et replanifier les conteneurs défaillants." },
    { icon: "FaExpandArrowsAlt", color: C.accent2, title: "Mise à l'échelle", text: "Plus de réplicas, répartition de charge." },
    { icon: "FaCodeBranch", color: C.accent4, title: "Mises à jour", text: "Progressives, avec rollback." },
  ], { cols: 4, h: 2.4, y: 1.3, gap: 0.2, fs: 13 });
  callout(s, "key", "Compose gère un hôte ; au-delà, on a besoin d'un orchestrateur.", { y: 4.0, h: 0.7 });

  s = slide("Docker Swarm en pratique", "Swarm est simple et proche de Compose. Quorum Raft : 3 managers tolèrent 1 panne, 5 en tolèrent 2.");
  code(s, `$ docker swarm init --advertise-addr <IP>
$ docker service create --name web --replicas 3 \\
    -p 8080:80 nginx:1.27-alpine
$ docker service scale web=5
$ docker service update --image nginx:1.27.2-alpine \\
    --update-parallelism 1 --update-delay 10s web
$ docker service rollback web
$ docker stack deploy -c stack.yaml demo`, { x: 0.5, y: 1.3, w: 5.5, h: 3.0, fs: 11, label: "swarm" });
  bullets(s, [
    ["Manager :", "état du cluster (Raft)."],
    ["Worker :", "exécute les tâches."],
    ["Service :", "état désiré ; tâche = instance."],
    ["Ports :", "2377, 7946, 4789."],
  ], { x: 6.2, y: 1.4, w: 3.3, h: 2.8, fontSize: 14, gap: 8 });
  callout(s, "tip", "update_config.order: start-first donne des mises à jour sans interruption si le healthcheck est bon.", { y: 4.4, h: 0.65, fs: 13 });

  s = slide("De Docker vers Kubernetes", "Vos images Docker/OCI fonctionnent telles quelles dans Kubernetes. Ce sont les manifestes qui changent.");
  table(s, [
    ["Docker / Swarm", "Kubernetes"],
    ["Conteneur", "Container dans un Pod"],
    ["Service Swarm (replicas)", "Deployment (+ ReplicaSet)"],
    ["Port publié, routing mesh", "Service + Ingress / Gateway"],
    ["Volume", "PersistentVolumeClaim"],
    ["Secrets, configs", "Secret, ConfigMap"],
    ["HEALTHCHECK", "liveness, readiness, startup probes"],
  ], { colW: [4.2, 4.8], fs: 14 });

  s = slide("Le même service sur Kubernetes", "Équivalent durci : non-root, FS en lecture seule, capabilities supprimées, probes, requests et limits.");
  code(s, `apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 3
  strategy: { type: RollingUpdate }
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      securityContext: { runAsNonRoot: true, runAsUser: 101 }
      containers:
      - name: web
        image: nginxinc/nginx-unprivileged:1.27-alpine
        resources: { requests: { cpu: 100m, memory: 64Mi },
                     limits:   { cpu: 250m, memory: 128Mi } }
        readinessProbe: { httpGet: { path: /, port: 8080 } }
        securityContext: { readOnlyRootFilesystem: true,
                           capabilities: { drop: [ALL] } }
# + un volume emptyDir monté sur /tmp (nginx y écrit)`, { x: 0.5, y: 1.25, w: 9, h: 3.7, fs: 10, label: "Deployment" });

  s = slide("Quelle plateforme choisir", "Aucune solution universelle : adapter à la taille de l'équipe et au besoin.");
  table(s, [
    ["Contexte", "Choix raisonnable"],
    ["Petit projet, 1 à 2 développeurs", "Compose sur une VM, Cloud Run, Fly.io"],
    ["Quelques nœuds, besoins simples", "Swarm (en connaissance de la pérennité)"],
    ["PME, 15 services", "Kubernetes managé ou ECS Fargate"],
    ["Grande entreprise, multi-équipes", "Kubernetes managé + plateforme interne (GitOps)"],
  ], { colW: [4.2, 4.8], fs: 14 });
  callout(s, "key", "conteneurs sans état, config par l'environnement, logs sur stdout, arrêt propre : les bases des 12 facteurs.", { y: 3.9, h: 0.9, fs: 13 });

  // ===== 14 EXPERT =====
  newSection("14 · Expert");
  sectionSlide(14, "Expert : internals et dépannage", "runc, namespaces, cgroups, overlayfs, troubleshooting", "Module 14 : environ 4 heures. Script pédagogique : mini-docker.sh.");

  s = slide("La pile d'exécution en détail", "Le shim garde les flux ouverts et permet de redémarrer dockerd sans tuer les conteneurs. runc lit un bundle OCI : config.json + rootfs.");
  flow(s, ["docker CLI", "dockerd", "containerd", "shim", "runc", "processus"], {
    y: 1.5, h: 0.8, fs: 12, colors: [C.accent1, C.accent4, C.accent3, C.accent2, C.accent5, C.text1],
    sub: ["HTTP/socket", "API, réseau, build", "images, snapshots", "survit au démon", "namespaces + cgroups", "votre appli"],
  });
  code(s, `$ docker run -d --name x alpine sleep 300
$ ps -ef --forest | grep -B2 -A3 'sleep 300'
$ sudo runc --root /run/docker/runtime-runc/moby list
$ sudo jq '.linux.namespaces' /run/containerd/.../moby/<ID>/config.json`, { x: 0.5, y: 3.6, w: 9, h: 1.3, fs: 11, label: "runc" });

  s = slide("Namespaces et cgroups v2", "nsenter permet de déboguer un conteneur sans shell avec les outils de l'hôte. Le throttling CPU explique des latences sans CPU saturé.");
  table(s, [
    ["Namespace", "Isole"],
    ["mnt · pid · net", "montages · PID · réseau"],
    ["ipc · uts", "IPC · hostname"],
    ["user · cgroup · time", "UID · hiérarchie · horloges"],
  ], { x: 0.5, y: 1.3, w: 4.3, colW: [1.8, 2.5], fs: 12 });
  table(s, [
    ["Fichier cgroup", "Rôle"],
    ["memory.max", "limite mémoire dure"],
    ["cpu.max", "quota (50000 100000 = 0,5 CPU)"],
    ["cpu.stat", "nr_throttled : bridage"],
    ["pids.max", "nombre de processus"],
  ], { x: 5.0, y: 1.3, w: 4.5, colW: [1.7, 2.8], fs: 12 });
  code(s, `$ PID=$(docker inspect -f '{{.State.Pid}}' mon-conteneur)
$ sudo nsenter -t $PID -n ss -tlnp        # réseau du conteneur, outils de l'hôte
$ sudo lsns -p $PID`, { x: 0.5, y: 3.5, w: 9, h: 1.0, fs: 11, label: "nsenter" });
  callout(s, "warn", "des limites CPU trop basses créent du throttling : surveillez nr_throttled.", { y: 4.6, h: 0.5, fs: 13 });

  s = slide("OverlayFS et système de fichiers", "Lecture dans la couche la plus haute, écriture par copy-up, suppression par whiteout.");
  box(s, { x: 0.5, y: 1.4, w: 4.2, h: 0.6, text: "upperdir (RW) : écritures, whiteouts", fill: C.accent2, fs: 13 });
  box(s, { x: 0.5, y: 2.1, w: 4.2, h: 0.6, text: "lowerdir (RO) : couches de l'image", fill: C.accent4, fs: 13 });
  box(s, { x: 0.5, y: 2.9, w: 4.2, h: 0.7, text: "merged : ce que voit le conteneur", fill: C.accent3, fs: 14 });
  bullets(s, [
    ["Lecture :", "couche la plus haute contenant le fichier."],
    ["Écriture :", "copy-up du fichier entier : coûteux pour les gros fichiers."],
    ["Suppression :", "fichier spécial « whiteout » dans l'upper."],
  ], { x: 5.0, y: 1.4, w: 4.5, h: 2.4, fontSize: 14, gap: 8 });
  code(s, `$ docker inspect -f '{{json .GraphDriver.Data}}' x | jq
$ docker diff x            # A (ajouté), C (modifié), D (supprimé)`, { x: 0.5, y: 3.9, w: 9, h: 0.8, fs: 11, label: "overlay" });

  s = slide("Méthodologie de dépannage", "Changer une seule variable à la fois. Comparer avec un conteneur sain.");
  flow(s, ["Décrire", "État", "Logs", "Reproduire", "Ressources", "Processus"], {
    y: 1.45, h: 0.75, fs: 13, colors: [C.accent1, C.accent4, C.accent3, C.accent2, C.accent5, C.text1],
    sub: ["Quoi, depuis quand ?", "ps -a, inspect, events", "docker logs, journalctl", "run -it --entrypoint sh", "stats, cgroups, dmesg", "strace, lsof, /proc"],
  });
  table(s, [
    ["Symptôme", "Cause fréquente"],
    ["exec format error", "mauvaise architecture ou fins de ligne CRLF"],
    ["no space left on device", "/var/lib/docker plein : logs, images"],
    ["Exited (137)", "OOM ou SIGKILL"],
  ], { y: 3.5, colW: [3.0, 6.0], fs: 13 });

  s = slide("Construire un conteneur à la main", "Le script mini-docker.sh montre qu'un conteneur n'est que des appels noyau assemblés. Il lui manque réseau, couches, seccomp, userns.");
  code(s, `# mini-docker.sh : rootfs + unshare + chroot
unshare --pid --fork --mount --uts --ipc --net \\
  bash -c '
    echo $$ > $CG/cgroup.procs       # limites mémoire / pids
    mount -t proc proc $ROOTFS/proc
    hostname mini-conteneur
    exec chroot $ROOTFS "$@"
  ' _ /bin/sh`, { x: 0.5, y: 1.3, w: 6.0, h: 2.6, fs: 11, label: "mini-docker" });
  cards(s, [
    { icon: "FaCheckCircle", color: C.accent3, title: "Il a", text: "pid, mnt, uts, ipc, net + cgroup." },
    { icon: "FaTimesCircle", color: C.accent5, title: "Il n'a pas", text: "veth/bridge, overlay, seccomp, userns." },
  ], { cols: 1, x0: 6.7, w: 2.8, h: 1.5, y: 1.3, gap: 0.1, fs: 12, tfs: 14 });
  callout(s, "lab", "à lancer avec sudo sur une machine de formation (cgroups v2).", { y: 4.1, h: 0.7 });

  // ===== 15 PROJET FINAL =====
  newSection("15 · Projet final");
  sectionSlide(15, "Projet final", "Une application « Todo » de la machine du développeur à la production", "Module 15 : environ 6 heures. Code dans modules/15-projet-final/projet.");

  s = slide("Architecture cible", "Seul le proxy est publié. La base est sur un réseau internal. Tout a été exécuté et vérifié pour de vrai.");
  box(s, { x: 0.5, y: 1.9, w: 2.3, h: 1.0, text: "proxy (nginx)\nFS en lecture seule", fill: C.accent1, fs: 13 });
  box(s, { x: 3.6, y: 1.9, w: 2.3, h: 1.0, text: "api (gunicorn/Flask)\nnon-root, cap_drop ALL", fill: C.accent4, fs: 13 });
  box(s, { x: 6.7, y: 1.9, w: 2.8, h: 1.0, text: "db (PostgreSQL 16)\nvolume pgdata", fill: C.accent3, fs: 13 });
  [[2.85, 1.3], [5.95, 1.3]].forEach(([ax]) => s.addShape(SHAPE.rightArrow, { x: ax, y: 2.28, w: 0.7, h: 0.25, fill: { color: C.text2 }, line: { color: C.text2, width: 0 } }));
  s.addText("front", { x: 0.5, y: 1.45, w: 5.4, h: 0.35, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText("back (internal)", { x: 3.6, y: 3.05, w: 5.9, h: 0.35, fontSize: 14, bold: true, color: C.accent3, align: "right", margin: 0, isTextBox: true });
  code(s, `$ cd modules/15-projet-final/projet
$ cp .env.example .env
$ make test && make up && make smoke      # tests, démarrage, test de fumée`, { x: 0.5, y: 3.55, w: 9, h: 1.0, fs: 11, label: "démarrage" });

  s = slide("Ce qui a été vérifié pour de vrai", "Slide de confiance : ces résultats ont été obtenus lors de la relecture, sur un démon Docker réel.");
  cards(s, [
    { icon: "FaHeartbeat", color: C.accent3, title: "3 services healthy", text: "proxy, api et db démarrent avec docker compose up --wait." },
    { icon: "FaShieldAlt", color: C.accent1, title: "Isolation prouvée", text: "db invisible depuis le proxy ; api en uid 10001, FS en lecture seule." },
    { icon: "FaDatabase", color: C.accent4, title: "Persistance", text: "les tâches survivent à un down puis up." },
    { icon: "FaBug", color: C.accent5, title: "Panne gérée", text: "DB arrêtée : /health répond 503, puis retour à healthy." },
  ], { cols: 2, h: 1.45, y: 1.3, gap: 0.15, fs: 13, tfs: 15 });
  callout(s, "tip", "le test a aussi trouvé un vrai bug (JSON indenté par Flask en debug), corrigé dans smoke-test.sh.", { y: 4.4, h: 0.7, fs: 13 });

  s = slide("Les six jalons", "Chaque jalon réutilise un ou plusieurs modules. Livrables : dépôt, pipeline vert, rapport d'une page, démo de 10 minutes.");
  table(s, [
    ["Jalon", "Contenu", "Modules"],
    ["1. Image", "Multi-stage, taille, labels, cache", "05-06"],
    ["2. Compose et données", "Isolation, backup/restore, migration", "07-09"],
    ["3. CI/CD", "Lint, tests, scan, push GHCR, déploiement", "10"],
    ["4. Sécurité", "Durcissement, secrets, scan propre", "11"],
    ["5. Observabilité", "Logs JSON, /metrics, alerte", "12"],
    ["6. Échelle", "Swarm ou Kubernetes (bonus)", "13"],
  ], { colW: [2.6, 4.9, 1.5], fs: 13 });

  s = slide("Grille d'évaluation", "Seuil de validation 70 sur 100. De 70 à 84 : Praticien. À partir de 85 : Expert.");
  s.addChart(pres.charts.BAR, [{ name: "Points", labels: ["Dockerfile", "Compose", "Données", "CI/CD", "Sécurité", "Observabilité", "Doc et démo", "Bonus"], values: [15, 15, 10, 20, 15, 10, 10, 5] }], {
    x: 0.5, y: 1.25, w: 5.6, h: 3.7, barDir: "bar", chartColors: [L.THEME.colors.accent1],
    showTitle: true, title: "Barème (100 points)", titleFontSize: 14, titleColor: L.THEME.colors.dk2, titleFontFace: "+mn-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: L.THEME.colors.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: L.THEME.colors.dk1, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
  });
  stat(s, 6.4, 1.3, 3.1, "70/100", "seuil de validation", C.accent1);
  stat(s, 6.4, 3.0, 3.1, "85+", "niveau Expert", C.accent3);

  // ===== CONCLUSION =====
  newSection("Conclusion");
  s = slide("Votre feuille de route", "Encourager à pratiquer. Les labos corrigés et le projet servent de portfolio. La certification est un jalon, pas une fin.");
  cards(s, [
    { icon: "FaCertificate", color: C.accent1, title: "Certifications", text: "DCA pour Docker. CKA et CKAD pour Kubernetes : la suite logique." },
    { icon: "FaBook", color: C.accent4, title: "Pour approfondir", text: "12 facteurs, CIS Docker Benchmark, Container Security (Liz Rice)." },
    { icon: "FaUsers", color: C.accent3, title: "Pratiquer", text: "Play with Docker, Killercoda, vos propres projets conteneurisés." },
  ], { cols: 3, h: 2.5, y: 1.3 });
  callout(s, "key", "annexes du dépôt : aide-mémoire, glossaire, préparation DCA, ressources.", { y: 4.0, h: 0.7 });

  s = slide("Les dix règles à retenir", "Terminer par cette checklist : c'est l'essentiel de la formation en une slide.");
  const rules = [
    "Pinner les versions d'images, idéalement par digest",
    "Un processus par conteneur, logs sur stdout",
    "Dockerfile : dépendances avant le code, forme exec",
    "Multi-stage et images minimales",
    "Utilisateur non-root, capabilities supprimées",
    "Aucun secret dans l'image ni dans ENV",
    "Volumes nommés pour les données",
    "Réseaux utilisateur, publier le strict minimum",
    "Healthchecks, limites, rotation des logs",
    "Construire une fois, scanner, signer, déployer par digest",
  ];
  rules.forEach((r, i) => {
    const col = i < 5 ? 0 : 1, row = i % 5;
    const x = 0.5 + col * 4.6, y = 1.3 + row * 0.72;
    s.addShape(SHAPE.ellipse, { x, y, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 } });
    s.addText(String(i + 1), { x, y, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(r, { x: x + 0.62, y: y - 0.07, w: 3.85, h: 0.64, fontSize: 13, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });

  const end = titleSlide("Merci et bonne pratique", "Le dépôt : github.com/nzembouong18/docker", (sl) => {
    sl.addText(AUTHOR, { x: 0.7, y: 3.95, w: 5.8, h: 0.4, fontSize: 20, bold: true, color: C.background1, margin: 0, isTextBox: true, objectName: "Auteur" });
    sl.addText(AUTHOR_ROLE, { x: 0.7, y: 4.35, w: 5.8, h: 0.35, fontSize: 16, color: C.background2, margin: 0, isTextBox: true, objectName: "Fonction" });
  });
  end.addNotes("Remercier les participants, rappeler le dépôt GitHub et inviter aux questions.");
};
