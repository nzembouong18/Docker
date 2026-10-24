# Labos — Module 07

## Lab 7.1 — Base de données persistante (20 min)
1. Lancez MariaDB (ou PostgreSQL) avec un volume nommé.
2. Créez une base, une table et 100 lignes (`generate_series` / boucle).
3. Supprimez le conteneur, relancez-en un nouveau avec le même volume, comptez les lignes.
4. Inspectez le volume sur l'hôte (`docker volume inspect`) : où sont les fichiers ?

## Lab 7.2 — Backup & restore automatisés (30 min)
Écrivez `backup.sh` et `restore.sh` qui, pour un volume donné :
- sauvegardent vers `./backups/<volume>-<date>.tar.gz` via un conteneur Alpine éphémère,
- restaurent vers un **nouveau** volume,
- vérifient l'intégrité (`tar tzf`).
Ajoutez un dump logique de la base du Lab 7.1 (`pg_dump`/`mysqldump`) et comparez.

## Lab 7.3 — Environnement de dev avec bind mount (25 min)
Exécutez [`app-node`](../05-dockerfile/app-node/) avec le code source monté et `nodemon` (ou `node --watch`) pour recharger automatiquement lors d'une modification de `server.js`. Affichez les logs et vérifiez le rechargement.
Bonus : réglez le problème de permissions sur un fichier créé par le conteneur.

## Lab 7.4 — Partager des données entre conteneurs (20 min)
Un conteneur « producteur » écrit un horodatage chaque seconde dans `/shared/log.txt`; un conteneur « consommateur » (lecture seule) l'affiche avec `tail -f`. Utilisez un volume nommé, puis refaites avec `--volumes-from`.

## Lab 7.5 — Conteneur durci (20 min)
Lancez `nginx:alpine` avec `--read-only`, uniquement les `tmpfs` nécessaires (`/var/cache/nginx`, `/var/run`, `/tmp`) et un volume `:ro` pour le contenu. Il doit démarrer et servir une page. Listez ce qu'il a fallu autoriser et pourquoi.

> Corrigés : [solutions.md](solutions.md)
