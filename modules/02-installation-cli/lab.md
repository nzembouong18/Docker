# Labos — Module 02

## Lab 2.1 — Installation et vérification (20 min)
1. Installez Docker (voir cours) et exécutez `./scripts/check-env.sh` à la racine du dépôt.
2. Notez : version du client, version du serveur, *storage driver*, version des cgroups (`docker info`).
3. Faites fonctionner `docker` sans `sudo`.

**Réussite** : le script affiche uniquement des ✅.

## Lab 2.2 — Mon premier site web (20 min)
1. Lancez nginx sur le port **9090** de l'hôte, nommé `site`.
2. Créez un fichier `index.html` local contenant « Bonjour <votre prénom> », et servez-le **sans construire d'image** (indice : `-v "$PWD":/usr/share/nginx/html:ro`).
3. Vérifiez avec `curl`. Modifiez le fichier : le changement est-il immédiat ? Pourquoi ?
4. Consultez les logs d'accès en direct pendant que vous faites 3 requêtes.

## Lab 2.3 — Base de données jetable (20 min)
1. Lancez PostgreSQL 16 (mot de passe de votre choix).
2. Via `docker exec`, créez une base `formation`, une table `stagiaires(id serial, nom text)` et insérez 2 lignes.
3. Supprimez le conteneur puis relancez-en un identique. Les données existent-elles encore ? Notez votre hypothèse (la réponse viendra au module 07).

## Lab 2.4 — Chasse aux codes de sortie (15 min)
Prédisez puis vérifiez le code de sortie (`docker run …; echo $?`) :
1. `alpine true`   2. `alpine false`   3. `alpine sh -c "exit 42"`   4. `alpine nomprog`
5. `alpine sleep 300` interrompu par `docker stop` (utilisez `docker inspect -f '{{.State.ExitCode}}'`).

## Lab 2.5 — Nettoyage (10 min)
1. Combien d'espace occupent vos images/conteneurs (`docker system df`) ?
2. Supprimez tous les conteneurs arrêtés, puis les images non utilisées.
3. Que ferait `docker system prune -a --volumes` ? (Ne le lancez pas sur une machine importante.)

> Corrigés : [solutions.md](solutions.md)
