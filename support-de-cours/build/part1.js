// Ouverture + modules 01 à 04
module.exports = function (L) {
  const { pres, C, SHAPE, AUTHOR, AUTHOR_ROLE, newSection, titleSlide, sectionSlide, slide, circleIcon, bullets, cards, card, code, callout, flow, table, stat, tag, box } = L;

  // ===== 0. OUVERTURE =====
  newSection("Ouverture");
  const t = titleSlide("Docker, du débutant à l'expert", "Conteneurs, images, Compose, sécurité, CI/CD et orchestration", (s) => {
    s.addText(AUTHOR, { x: 0.7, y: 4.05, w: 5.8, h: 0.4, fontSize: 20, bold: true, color: C.background1, margin: 0, isTextBox: true, objectName: "Auteur" });
    s.addText(AUTHOR_ROLE, { x: 0.7, y: 4.45, w: 5.8, h: 0.35, fontSize: 16, color: C.background2, margin: 0, isTextBox: true, objectName: "Fonction" });
  });
  t.addNotes("Bienvenue. Cette formation suit le dépôt GitHub nzembouong18/docker : chaque module du support correspond à un dossier avec cours, démos, labos corrigés et quiz.");

  let s = slide("Ce que vous saurez faire à la fin", "Présenter les objectifs. Insister sur le fait que la formation est pratique : chaque notion est suivie d'une démo et d'un labo.");
  cards(s, [
    { icon: "FaCube", color: C.accent1, title: "Comprendre", text: "Ce qu'est vraiment un conteneur : namespaces, cgroups, couches. Plus de magie." },
    { icon: "FaTerminal", color: C.accent4, title: "Maîtriser", text: "La CLI, les Dockerfile propres et rapides, Compose pour les applications multi-services." },
    { icon: "FaShieldAlt", color: C.accent3, title: "Sécuriser", text: "Non-root, capabilities, scan de CVE, secrets, signature des images." },
    { icon: "FaRocket", color: C.accent2, title: "Livrer", text: "CI/CD, observabilité, dépannage, puis passage à Swarm et Kubernetes." },
  ], { cols: 2, h: 1.7, y: 1.3, gap: 0.2 });

  s = slide("Votre formateur", "Se présenter brièvement : expérience DevOps et Kubernetes, ce qui motive cette formation.");
  s.addShape(SHAPE.roundRect, { x: 0.5, y: 1.35, w: 4.2, h: 3.5, rectRadius: 0.08, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, shadow: L.shadow(), objectName: "Carte auteur" });
  circleIcon(s, "FaGraduationCap", 0.8, 1.65, 0.9, C.accent1, "Pastille auteur");
  s.addText(AUTHOR, { x: 0.8, y: 2.75, w: 3.7, h: 0.5, fontSize: 22, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText(AUTHOR_ROLE, { x: 0.8, y: 3.25, w: 3.7, h: 0.4, fontSize: 16, color: C.accent1, margin: 0, isTextBox: true });
  s.addText("Auteur du dépôt et de ce support de cours", { x: 0.8, y: 3.8, w: 3.7, h: 0.7, fontSize: 14, color: C.background2, margin: 0, isTextBox: true });
  bullets(s, [
    ["Approche :", "expliquer le « pourquoi » avant le « comment »."],
    ["Méthode :", "théorie courte, démonstration, labo, quiz."],
    ["Fil rouge :", "une application réelle, du poste de dev à la production."],
    ["Dépôt :", "github.com/nzembouong18/docker : tout est rejouable."],
  ], { x: 5.0, y: 1.45, w: 4.5, h: 3.4, fontSize: 15 });

  s = slide("Le parcours en 16 modules", "Présenter la progression par niveaux : vert débutant, jaune intermédiaire, orange avancé, rouge expert. Durée totale environ 45 heures.");
  const mods = [
    ["00", "Prérequis", C.accent3], ["01", "Introduction", C.accent3], ["02", "Installation & CLI", C.accent3], ["03", "Images & registres", C.accent3],
    ["04", "Conteneurs", C.accent3], ["05", "Dockerfile", C.accent6], ["06", "Dockerfile avancé", C.accent6], ["07", "Volumes", C.accent6],
    ["08", "Réseau", C.accent6], ["09", "Compose", C.accent6], ["10", "CI/CD", C.accent2], ["11", "Sécurité", C.accent2],
    ["12", "Observabilité", C.accent2], ["13", "Orchestration", C.accent5], ["14", "Expert", C.accent5], ["15", "Projet final", C.accent5],
  ];
  mods.forEach(([n, name, col], i) => {
    const cx = 0.5 + (i % 4) * 2.28, cy = 1.3 + Math.floor(i / 4) * 0.82;
    s.addShape(SHAPE.roundRect, { x: cx, y: cy, w: 2.15, h: 0.7, rectRadius: 0.08, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: "Module " + n });
    s.addShape(SHAPE.ellipse, { x: cx + 0.1, y: cy + 0.12, w: 0.46, h: 0.46, fill: { color: col }, line: { color: col, width: 0 } });
    s.addText(n, { x: cx + 0.1, y: cy + 0.12, w: 0.46, h: 0.46, fontSize: 13, bold: true, color: C.text2, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(name, { x: cx + 0.62, y: cy, w: 1.5, h: 0.7, fontSize: 14, bold: true, color: C.text2, valign: "middle", margin: 0, isTextBox: true });
  });
  tag(s, "Débutant", 0.5, 4.7, 1.2, C.accent3); tag(s, "Intermédiaire", 1.85, 4.7, 1.5, C.accent6);
  tag(s, "Avancé", 3.5, 4.7, 1.1, C.accent2); tag(s, "Expert", 4.75, 4.7, 1.0, C.accent5);

  s = slide("Comment travailler avec le dépôt", "Montrer l'arborescence et la méthode : lire, rejouer la démo, faire le labo sans regarder la solution, passer le quiz.");
  code(s, `docker/
├── README.md          # sommaire
├── modules/
│   ├── 01-introduction/
│   │   ├── README.md  # le cours
│   │   ├── demo.md    # démonstrations
│   │   ├── lab.md     # labos
│   │   ├── solutions.md
│   │   └── quiz.md
│   └── ... 15-projet-final/
├── annexes/           # aide-mémoire, DCA
└── .github/workflows/ # CI du dépôt`, { x: 0.5, y: 1.3, w: 5.1, h: 3.55, fs: 12, label: "arborescence" });
  bullets(s, [
    ["1.", "Lire le cours du module"],
    ["2.", "Rejouer la démo"],
    ["3.", "Faire le labo sans la solution"],
    ["4.", "Vérifier avec le corrigé"],
    ["5.", "Passer le quiz (≥ 80 %)"],
  ], { x: 5.9, y: 1.4, w: 3.6, h: 2.6, fontSize: 16, gap: 10 });
  callout(s, "tip", "installez Docker ≥ 24, Compose v2 et Git, puis vérifiez avec ./scripts/check-env.sh.", { x: 5.9, y: 4.0, w: 3.6, h: 0.9, fs: 12 });

  // ===== 01 INTRODUCTION =====
  newSection("01 · Introduction aux conteneurs");
  sectionSlide(1, "Introduction aux conteneurs", "Pourquoi et comment ça marche, avant la moindre commande", "Module 01 : environ 2 heures. Objectif : comprendre ce qu'est un conteneur.");

  s = slide("Le problème : « ça marche chez moi »", "Raconter le scénario classique : dépendances différentes entre poste, CI et production. Le conteneur emballe l'application avec ses dépendances.");
  cards(s, [
    { icon: "FaBug", color: C.accent5, title: "Sans conteneur", text: "OS, runtime et bibliothèques diffèrent entre le poste, la CI, la préproduction et la production. Les bugs apparaissent aux frontières." },
    { icon: "FaBoxOpen", color: C.accent3, title: "Avec conteneur", text: "L'application voyage avec ses dépendances dans une unité standard, portable et reproductible. Même image partout." },
  ], { cols: 2, h: 2.2, y: 1.3, gap: 0.3, fs: 15 });
  flow(s, ["Poste dev", "CI", "Préprod", "Production"], { y: 3.8, h: 0.7, fs: 14, colors: [C.accent1] });
  s.addText("Build once, run anywhere : la même image traverse tous les environnements", { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 14, italic: true, color: C.text2, align: "center", margin: 0, isTextBox: true });

  s = slide("Machine virtuelle ou conteneur", "Point crucial : un conteneur partage le noyau de l'hôte. C'est un processus isolé, pas une VM.");
  // VM
  s.addText("Machines virtuelles", { x: 0.5, y: 1.25, w: 4.2, h: 0.35, fontSize: 16, bold: true, color: C.text2, margin: 0, isTextBox: true });
  [["App A", "App B", "App C"], ["OS invité", "OS invité", "OS invité"]].forEach((row, r) => row.forEach((t2, c) => box(s, { x: 0.5 + c * 1.43, y: 1.65 + r * 0.5, w: 1.35, h: 0.42, text: t2, fill: r ? C.accent4 : C.accent1, fs: 12 })));
  box(s, { x: 0.5, y: 2.65, w: 4.2, h: 0.42, text: "Hyperviseur", fill: C.text2, fs: 13 });
  box(s, { x: 0.5, y: 3.12, w: 4.2, h: 0.42, text: "OS hôte + matériel", fill: C.text1, fs: 13 });
  // Conteneurs
  s.addText("Conteneurs", { x: 5.3, y: 1.25, w: 4.2, h: 0.35, fontSize: 16, bold: true, color: C.text2, margin: 0, isTextBox: true });
  ["App A", "App B", "App C"].forEach((t2, c) => box(s, { x: 5.3 + c * 1.43, y: 1.65, w: 1.35, h: 0.42, text: t2, fill: C.accent1, fs: 12 }));
  ["Libs", "Libs", "Libs"].forEach((t2, c) => box(s, { x: 5.3 + c * 1.43, y: 2.15, w: 1.35, h: 0.42, text: t2, fill: C.accent3, fs: 12 }));
  box(s, { x: 5.3, y: 2.65, w: 4.2, h: 0.42, text: "Docker Engine", fill: C.text2, fs: 13 });
  box(s, { x: 5.3, y: 3.12, w: 4.2, h: 0.42, text: "OS hôte (noyau partagé) + matériel", fill: C.text1, fs: 13 });
  table(s, [
    ["", "VM", "Conteneur"],
    ["Taille", "Go", "Mo"],
    ["Démarrage", "Minutes", "Secondes"],
    ["Isolation", "Forte (noyau dédié)", "Plus faible (noyau partagé)"],
  ], { y: 3.75, colW: [1.8, 3.6, 3.6], fs: 13 });

  s = slide("Trois briques du noyau Linux", "Un conteneur n'est pas une chose en soi : c'est un processus Linux + ces trois mécanismes. On les manipulera au module 14.");
  cards(s, [
    { icon: "FaEye", color: C.accent1, title: "Namespaces", text: "Ce que le processus VOIT : ses PID, son réseau, ses montages, son hostname." },
    { icon: "FaTachometerAlt", color: C.accent2, title: "cgroups", text: "Ce qu'il peut CONSOMMER : CPU, mémoire, I/O, nombre de processus." },
    { icon: "FaLayerGroup", color: C.accent4, title: "OverlayFS", text: "Ses FICHIERS : des couches en lecture seule empilées + une couche inscriptible." },
  ], { cols: 3, h: 2.5, y: 1.3 });
  callout(s, "key", "un conteneur = un processus isolé (namespaces), limité (cgroups), avec un système de fichiers en couches.", { y: 4.1, h: 0.8 });

  s = slide("Architecture de Docker", "Dérouler le chemin d'un docker run : CLI vers dockerd via le socket, puis containerd, puis runc qui crée les namespaces et cgroups.");
  flow(s, ["docker CLI", "dockerd", "containerd", "runc", "Conteneur"], {
    y: 1.5, h: 0.9, fs: 14,
    sub: ["Client en ligne de commande, parle HTTP au démon", "Démon : API, réseaux, volumes, build", "Images, snapshots, cycle de vie", "Runtime OCI : crée namespaces + cgroups", "Le processus de votre application"],
  });
  box(s, { x: 2.55, y: 3.55, w: 4.9, h: 0.55, text: "Registry : Docker Hub, GHCR, ECR, Harbor…", fill: C.text2, fs: 14 });
  s.addText("pull / push", { x: 7.55, y: 3.6, w: 1.5, h: 0.45, fontSize: 13, italic: true, color: C.text2, margin: 0, isTextBox: true });
  callout(s, "warn", "le socket /var/run/docker.sock donne un accès root à l'hôte : ne le montez jamais dans un conteneur applicatif.", { y: 4.3, h: 0.75, fs: 13, w: 9 });

  s = slide("Vocabulaire fondamental", "Faire reformuler image vs conteneur par analogie classe/objet.");
  table(s, [
    ["Terme", "Définition simple"],
    ["Image", "Modèle immuable en couches (comme une classe)"],
    ["Conteneur", "Instance en exécution d'une image (comme un objet)"],
    ["Dockerfile", "Recette textuelle pour construire une image"],
    ["Registry", "Serveur qui stocke et distribue les images"],
    ["Volume", "Stockage persistant géré par Docker"],
    ["Compose", "Décrit une application multi-conteneurs en YAML"],
  ], { colW: [2.2, 6.8], fs: 14, y: 1.35 });

  s = slide("Le cycle de vie global", "Résumer toute la formation en une ligne : build, push, pull, run. Chaque module approfondit un maillon.");
  flow(s, ["Dockerfile", "Image", "Registry", "Image", "Conteneur"], {
    y: 1.7, h: 0.9, fs: 14,
    sub: ["docker build", "couches immuables", "docker push", "docker pull", "docker run"],
  });
  callout(s, "key", "grâce au standard OCI, la même image fonctionne avec Docker, Podman, containerd et Kubernetes.", { y: 4.0, h: 0.8 });

  s = slide("À vous de jouer : labos du module 01", "Laisser 20 minutes. Les corrigés sont dans modules/01-introduction/solutions.md.");
  cards(s, [
    { icon: "FaSearch", color: C.accent1, title: "Observer l'isolation", text: "Comparer les namespaces d'un conteneur nginx et de votre shell avec /proc/<pid>/ns." },
    { icon: "FaTachometerAlt", color: C.accent2, title: "Limiter les ressources", text: "Lancer un conteneur à 0,5 CPU et 64 Mo, et le constater avec docker stats." },
    { icon: "FaSitemap", color: C.accent4, title: "VM ou conteneur ?", text: "Justifier le choix pour 4 scénarios (50 APIs, Windows, code non fiable, dev)." },
  ], { cols: 3, h: 2.3, y: 1.3 });
  callout(s, "lab", "modules/01-introduction/lab.md : démos et labos corrigés dans le dépôt.", { y: 3.9, h: 0.7 });

  // ===== 02 INSTALLATION & CLI =====
  newSection("02 · Installation et CLI");
  sectionSlide(2, "Installation et prise en main de la CLI", "Installer Docker et maîtriser docker run", "Module 02 : environ 2 heures.");

  s = slide("Installer Docker Engine (Ubuntu)", "Montrer le dépôt officiel plutôt que le script get.docker.com, réservé aux labos. Rappeler que le groupe docker équivaut à root.");
  code(s, `# 1. Dépôt officiel Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
# ajouter la clé et le dépôt (voir docs.docker.com)

# 2. Installation
sudo apt-get install -y docker-ce docker-ce-cli \\
  containerd.io docker-buildx-plugin \\
  docker-compose-plugin

# 3. Utiliser docker sans sudo
sudo usermod -aG docker $USER && newgrp docker
$ docker run hello-world`, { x: 0.5, y: 1.3, w: 5.9, h: 3.6, fs: 11, label: "installation" });
  cards(s, [
    { icon: "FaDesktop", color: C.accent1, title: "macOS / Windows", text: "Docker Desktop (WSL2 sous Windows)." },
    { icon: "FaCloud", color: C.accent4, title: "Sans installer", text: "Play with Docker ou un Codespace." },
  ], { cols: 1, x0: 6.6, w: 2.9, h: 1.35, y: 1.3, gap: 0.12, fs: 13 });
  callout(s, "warn", "le groupe docker = accès root (mode rootless : module 11).", { x: 6.6, y: 4.2, w: 2.9, h: 0.75, fs: 12 });

  s = slide("Anatomie de docker run", "docker run fait pull, create, start puis attach. Présenter les options les plus courantes.");
  code(s, `docker run [OPTIONS] IMAGE [COMMANDE]

docker run -d --name web \\
  -p 8080:80 \\
  -e MODE=prod \\
  -v data:/var/lib/x \\
  --restart unless-stopped \\
  nginx:1.27-alpine`, { x: 0.5, y: 1.3, w: 4.4, h: 3.0, fs: 11, label: "docker run" });
  table(s, [
    ["Option", "Rôle"],
    ["-d", "arrière-plan"],
    ["-it", "shell interactif"],
    ["--name", "nom du conteneur"],
    ["-p H:C", "publie un port"],
    ["-e K=V", "variable d'env."],
    ["-v", "volume / bind"],
    ["--rm", "supprime à l'arrêt"],
    ["-m, --cpus", "limites"],
  ], { x: 5.1, y: 1.3, w: 4.4, colW: [1.3, 3.1], fs: 12 });
  callout(s, "tip", "nommez toujours vos conteneurs et pinnez les tags : nginx:1.27-alpine, jamais latest.", { y: 4.45, h: 0.65 });

  s = slide("Premier serveur web, pas à pas", "Dérouler en direct : lancer, tester avec curl, lire les logs, entrer dans le conteneur, nettoyer.");
  code(s, `$ docker run -d --name web -p 8080:80 nginx:1.27-alpine
$ curl http://localhost:8080          # page d'accueil nginx
$ docker logs web                     # journaux du conteneur
$ docker exec -it web sh              # shell dans le conteneur
$ docker stop web && docker rm web    # arrêt puis suppression`, { x: 0.5, y: 1.3, w: 9, h: 1.9, fs: 12, label: "web" });
  cards(s, [
    { icon: "FaPlay", color: C.accent3, title: "Un conteneur vit", text: "tant que son processus principal vit." },
    { icon: "FaTerminal", color: C.accent1, title: "exec", text: "lance un NOUVEAU processus dans le conteneur." },
    { icon: "FaTrash", color: C.accent5, title: "--rm", text: "supprime automatiquement à l'arrêt : idéal pour tester." },
  ], { cols: 3, h: 1.35, y: 3.6, gap: 0.2, fs: 13 });

  s = slide("Les commandes de gestion au quotidien", "Insister sur docker inspect avec --format : c'est l'outil de diagnostic numéro un.");
  table(s, [
    ["Action", "Commande"],
    ["Conteneurs actifs / tous", "docker ps  ·  docker ps -a"],
    ["Arrêter, démarrer, redémarrer", "docker stop · start · restart NOM"],
    ["Logs en direct", "docker logs -f --tail 100 NOM"],
    ["Détails d'un champ", "docker inspect -f '{{.State.Status}}' NOM"],
    ["Ressources en direct", "docker stats"],
    ["Copier un fichier", "docker cp NOM:/chemin ./local"],
    ["Espace disque Docker", "docker system df"],
  ], { colW: [3.6, 5.4], fs: 13 });

  s = slide("Codes de sortie : lire un échec", "Les codes 137 et 143 reviendront souvent : 128 + numéro du signal. À retenir par cœur.");
  table(s, [
    ["Code", "Signification", "Cause typique"],
    ["0", "Succès", "Le processus s'est terminé normalement"],
    ["1", "Erreur de l'application", "Exception, mauvaise config"],
    ["125 / 126 / 127", "Erreur Docker / non exécutable / introuvable", "Mauvais CMD ou ENTRYPOINT"],
    ["137", "128 + 9 : SIGKILL", "OOM (mémoire) ou docker kill"],
    ["139", "128 + 11 : segfault", "Mauvaise architecture ou bibliothèque"],
    ["143", "128 + 15 : SIGTERM", "Arrêt propre demandé par docker stop"],
  ], { colW: [1.8, 3.6, 3.6], fs: 13 });

  s = slide("À vous de jouer : labos du module 02", "Ces labos installent les bons réflexes : nommage, bind mount, base jetable, codes de sortie, nettoyage.");
  cards(s, [
    { icon: "FaGlobe", color: C.accent1, title: "Mon premier site", text: "Servir un index.html avec nginx via un bind mount, sans construire d'image." },
    { icon: "FaDatabase", color: C.accent4, title: "Base jetable", text: "PostgreSQL, créer une table, supprimer le conteneur : que reste-t-il ?" },
    { icon: "FaSearch", color: C.accent2, title: "Chasse aux codes", text: "Prédire puis vérifier le code de sortie de 5 commandes." },
  ], { cols: 3, h: 2.3, y: 1.3 });
  callout(s, "lab", "modules/02-installation-cli/lab.md. La base perdue annonce le module 07 (volumes).", { y: 3.9, h: 0.7 });

  // ===== 03 IMAGES =====
  newSection("03 · Images et registres");
  sectionSlide(3, "Images et registres", "Couches, tags, digests et distribution", "Module 03 : environ 2 heures.");

  s = slide("Une image = des couches immuables", "Dessiner la pile au tableau. Chaque instruction du Dockerfile crée une couche. Les couches sont identifiées par un hash et partagées.");
  const layers = [
    ["Couche conteneur (lecture/écriture)", C.accent2, "créée au docker run, jetable"],
    ["COPY app/ /app", C.accent1, ""],
    ["RUN pip install -r requirements.txt", C.accent1, ""],
    ["RUN apt-get install …", C.accent1, ""],
    ["Image de base : debian-slim", C.accent4, ""],
  ];
  layers.forEach(([t2, col, sub], i) => box(s, { x: 0.5, y: 1.35 + i * 0.68, w: 5.2, h: 0.6, text: t2, fill: col, fs: 13 }));
  s.addText("lecture seule, partagées entre images", { x: 0.5, y: 4.8, w: 5.2, h: 0.3, fontSize: 12, italic: true, color: C.text2, margin: 0, isTextBox: true });
  bullets(s, [
    ["Hash sha256 :", "chaque couche est identifiée par son contenu."],
    ["Partage :", "deux images avec la même base ne la stockent qu'une fois."],
    ["Copy-on-write :", "modifier un fichier d'une couche basse le copie d'abord dans la couche inscriptible."],
  ], { x: 6.0, y: 1.4, w: 3.5, h: 3.4, fontSize: 14, gap: 10 });

  s = slide("Nommer une image : tag ou digest", "Un tag est mutable, un digest est immuable. En production, épingler au moins la version précise, idéalement le digest.");
  code(s, `[registre/][espace/]depot[:tag][@digest]

docker.io/library/nginx:1.27-alpine
ghcr.io/mon-org/mon-app:v1.2.0
registry.example.com:5000/equipe/api@sha256:ab12…`, { x: 0.5, y: 1.3, w: 9, h: 1.4, fs: 12, label: "nommage" });
  table(s, [
    ["Pratique", "Verdict"],
    ["python  ou  python:latest", "❌ imprévisible"],
    ["python:3.12", "⚠️ patchs mineurs mouvants"],
    ["python:3.12.7-slim-bookworm", "✅ précis"],
    ["python@sha256:…", "✅✅ immuable, reproductibilité maximale"],
  ], { y: 2.8, colW: [4.5, 4.5], fs: 14 });

  s = slide("Choisir son image de base", "Alpine est petit mais musl peut surprendre (wheels Python). Slim est souvent le meilleur compromis. Distroless pour la production.");
  table(s, [
    ["Variante", "Taille", "À savoir"],
    ["debian / ubuntu", "80-120 Mo", "Complet, glibc, apt"],
    ["-slim", "30-80 Mo", "Bon compromis, compatible"],
    ["-alpine", "5-50 Mo", "musl + apk : attention aux incompatibilités"],
    ["distroless", "2-20 Mo", "Pas de shell : surface d'attaque minimale"],
    ["scratch", "0", "Binaire statique (Go, Rust)"],
  ], { colW: [2.4, 1.8, 4.8], fs: 14 });
  callout(s, "tip", "numpy ou pandas ? Préférez -slim : sur Alpine, pas de wheels binaires, donc compilation et builds longs.", { y: 4.3, h: 0.7 });

  s = slide("Les commandes d'images", "Montrer docker image history pour lire les couches, et save/load pour le hors-ligne.");
  code(s, `$ docker pull nginx:1.27-alpine           # télécharger
$ docker images                           # lister
$ docker image history nginx:1.27-alpine  # couches et commandes
$ docker image inspect nginx:1.27-alpine  # métadonnées JSON
$ docker tag nginx:1.27-alpine monnginx:v1  # alias, même image
$ docker rmi monnginx:v1                  # supprimer un tag
$ docker image prune                      # supprimer les images dangling
$ docker save -o nginx.tar nginx:alpine   # exporter (hors-ligne)
$ docker load -i nginx.tar                # importer`, { x: 0.5, y: 1.3, w: 9, h: 3.0, fs: 12, label: "images" });
  callout(s, "key", "dangling = image sans tag (<none>), souvent un résidu de build.", { y: 4.45, h: 0.6 });

  s = slide("Registres et publication", "Docker Hub par défaut ; GHCR s'intègre à GitHub Actions. Un token à portée limitée plutôt qu'un mot de passe.");
  code(s, `$ docker login ghcr.io -u USER --password-stdin
$ docker tag monapp:1.0 ghcr.io/org/monapp:1.0
$ docker push ghcr.io/org/monapp:1.0

# Registre privé local en 3 lignes
$ docker run -d -p 5000:5000 --name registry registry:2
$ docker tag alpine localhost:5000/alpine:demo
$ docker push localhost:5000/alpine:demo
$ curl http://localhost:5000/v2/_catalog`, { x: 0.5, y: 1.3, w: 5.6, h: 3.0, fs: 11, label: "registre" });
  table(s, [
    ["Registre", "Usage"],
    ["Docker Hub", "Défaut, images officielles"],
    ["GHCR", "Avec GitHub Actions"],
    ["ECR / GAR / ACR", "Clouds privés"],
    ["Harbor, GitLab", "Auto-hébergés"],
  ], { x: 6.3, y: 1.3, w: 3.2, colW: [1.4, 1.8], fs: 12 });
  callout(s, "warn", "les identifiants sont stockés dans ~/.docker/config.json ; utilisez un credential helper et des tokens limités.", { y: 4.45, h: 0.65, fs: 13 });

  s = slide("À vous de jouer : labos du module 03", "Le lab du registre privé avec volume prépare la notion de persistance.");
  cards(s, [
    { icon: "FaBalanceScale", color: C.accent1, title: "Comparer les bases", text: "python:3.12, -slim et -alpine : taille, couches, libc." },
    { icon: "FaUpload", color: C.accent2, title: "Publier", text: "Pousser une image sur Docker Hub, la supprimer en local, la retirer." },
    { icon: "FaServer", color: C.accent4, title: "Registre privé", text: "registry:2 avec volume, API HTTP, redémarrage." },
  ], { cols: 3, h: 2.3, y: 1.3 });
  callout(s, "lab", "modules/03-images-registres/lab.md avec corrigés.", { y: 3.9, h: 0.7 });

  // ===== 04 CONTENEURS =====
  newSection("04 · Conteneurs en profondeur");
  sectionSlide(4, "Les conteneurs en profondeur", "Cycle de vie, signaux, ressources, redémarrage, logs", "Module 04 : environ 3 heures.");

  s = slide("États et cycle de vie", "Les transitions principales. Rappeler la différence entre stop (SIGTERM) et kill (SIGKILL).");
  flow(s, ["created", "running", "paused", "exited"], {
    y: 1.5, h: 0.8, fs: 16, colors: [C.accent4, C.accent3, C.accent6, C.accent5],
    sub: ["docker create", "docker start", "docker pause / unpause", "docker stop · rm"],
  });
  table(s, [
    ["Commande", "Effet"],
    ["docker stop", "SIGTERM, attend 10 s, puis SIGKILL"],
    ["docker kill", "SIGKILL immédiat (ou le signal choisi)"],
    ["docker restart", "stop puis start"],
    ["docker rm -f", "tue puis supprime"],
  ], { y: 3.3, colW: [2.6, 6.4], fs: 13 });

  s = slide("Le piège du PID 1 et des signaux", "Résultat mesuré en session : sans --init, docker stop met 10,1 s et le code est 137 ; avec --init, 0,18 s et code 143.");
  stat(s, 0.5, 1.3, 2.4, "10,1 s", "docker stop sans --init, code 137", C.accent5);
  stat(s, 3.0, 1.3, 2.4, "0,18 s", "docker stop avec --init, code 143", C.accent3);
  code(s, `# forme shell : sh est PID 1
CMD node server.js

# forme exec : node est PID 1
CMD ["node", "server.js"]

# ou : tini transmet les signaux
$ docker run --init -d monapp`, { x: 5.6, y: 1.3, w: 3.9, h: 2.1, fs: 11, label: "pid1" });
  bullets(s, [
    "Le noyau n'applique pas l'action par défaut des signaux au PID 1 d'un namespace.",
    "Sans handler SIGTERM, le processus ignore docker stop et se fait tuer après 10 s.",
  ], { x: 0.5, y: 3.3, w: 5.9, h: 1.4, fontSize: 14 });
  callout(s, "key", "forme exec + gestion de SIGTERM, ou --init.", { y: 4.55, h: 0.55, fs: 13 });

  s = slide("Ports et variables d'environnement", "EXPOSE est documentaire. Publier sur 127.0.0.1 par défaut en dev. La configuration vient de l'environnement (12 facteurs).");
  code(s, `-p 8080:80            # hôte:conteneur
-p 127.0.0.1:8080:80  # local seulement
-p 80                 # port hôte aléatoire
$ docker port web     # correspondances

-e DB_HOST=db         # variable
--env-file .env       # fichier KEY=VALUE`, { x: 0.5, y: 1.3, w: 5.6, h: 2.6, fs: 11, label: "ports" });
  cards(s, [
    { icon: "FaExclamationTriangle", color: C.accent5, title: "Pare-feu", text: "Docker contourne souvent ufw : -p ouvre au monde." },
  ], { cols: 1, x0: 6.3, w: 3.2, h: 2.6, y: 1.3, fs: 13 });
  callout(s, "warn", "ne mettez jamais de secret dans l'image ni dans ENV ; il reste visible avec docker inspect et docker history.", { y: 4.1, h: 0.7 });

  s = slide("Limiter les ressources (cgroups)", "Sans limite, un conteneur peut affamer l'hôte. L'OOM kill donne le code 137 et OOMKilled=true.");
  code(s, `$ docker run -d --name api \\
    -m 512m --memory-swap 512m \\   # RAM max
    --cpus 1.5 \\                    # 1,5 CPU
    --pids-limit 100 \\              # anti fork-bomb
    monapp

$ docker stats --no-stream
$ docker update --memory 1g --cpus 2 api   # à chaud`, { x: 0.5, y: 1.3, w: 5.4, h: 2.7, fs: 11, label: "limites" });
  stat(s, 6.2, 1.3, 3.3, "137", "code de sortie d'un conteneur tué par l'OOM killer (mesuré)", C.accent5);
  callout(s, "key", "définissez toujours des limites en production et vérifiez avec docker inspect -f '{{.State.OOMKilled}}'.", { y: 4.2, h: 0.8 });

  s = slide("Redémarrage et logs", "no n'est pas une stratégie de prod. json-file n'a pas de rotation par défaut : disque plein garanti.");
  table(s, [
    ["Politique", "Comportement"],
    ["no", "jamais (défaut)"],
    ["on-failure[:N]", "si code ≠ 0, N tentatives"],
    ["always", "toujours, même après reboot du démon"],
    ["unless-stopped", "comme always, sauf arrêt manuel"],
  ], { x: 0.5, y: 1.3, w: 4.4, colW: [1.7, 2.7], fs: 12 });
  code(s, `# Rotation des logs
$ docker run --log-opt max-size=10m \\
    --log-opt max-file=3 monapp

# daemon.json (global)
{ "log-driver": "local",
  "log-opts": { "max-size": "10m",
                "max-file": "3" } }`, { x: 5.1, y: 1.3, w: 4.4, h: 2.6, fs: 11, label: "logs" });
  callout(s, "tip", "écrivez les logs sur stdout/stderr, que Docker collecte, et jamais dans des fichiers du conteneur.", { y: 4.2, h: 0.75 });

  s = slide("Dépanner un conteneur qui s'arrête", "Méthode en 5 étapes, répétée dans le lab 4.5 avec cinq conteneurs volontairement cassés.");
  flow(s, ["docker ps -a", "docker logs", "docker inspect", "run --entrypoint sh", "Corriger"], {
    y: 1.5, h: 0.8, fs: 13, colors: [C.accent1, C.accent4, C.accent3, C.accent2, C.accent5],
    sub: ["Quel code de sortie ?", "Message d'erreur", ".State.OOMKilled, ExitCode, Error", "Reproduire à la main", "Config, limites, port"],
  });
  code(s, `$ docker inspect -f '{{.State.OOMKilled}} {{.State.ExitCode}} {{.State.Error}}' nom
$ docker run -it --entrypoint sh image`, { x: 0.5, y: 3.5, w: 9, h: 0.9, fs: 11, label: "diagnostic" });
  callout(s, "lab", "modules/04-conteneurs/lab.md : signaux, ressources, résilience, logs, diagnostic.", { y: 4.5, h: 0.6, fs: 13 });
};
