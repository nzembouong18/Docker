# Solutions — Module 02

## Lab 2.2
```bash
echo "Bonjour Awa" > index.html
docker run -d --name site -p 9090:80 -v "$PWD":/usr/share/nginx/html:ro nginx:alpine
curl localhost:9090
echo "Bonjour v2" > index.html && curl localhost:9090   # changement immédiat
docker logs -f site
```
Le changement est immédiat car le dossier est **monté** (bind mount) : le conteneur voit directement les fichiers de l'hôte. (Attention : certains éditeurs remplacent l'inode, ce qui peut casser un bind mount de *fichier* unique ; monter un dossier évite le souci.)

## Lab 2.3
```bash
docker run -d --name pg -e POSTGRES_PASSWORD=secret postgres:16-alpine
docker exec -it pg psql -U postgres -c "create database formation;"
docker exec -it pg psql -U postgres -d formation -c "create table stagiaires(id serial, nom text); insert into stagiaires(nom) values ('Awa'),('Paul');"
docker rm -f pg
```
Les données sont **perdues** : l'image `postgres` déclare un `VOLUME` anonyme, qui reste orphelin ; un nouveau conteneur en crée un nouveau. Solution : volume nommé (module 07).

## Lab 2.4
1. `0` 2. `1` 3. `42` 4. `127` (« command not found » ; Docker renvoie 127 si l'exécutable est introuvable, 126 s'il n'est pas exécutable) 5. `143` si le processus gère SIGTERM, sinon `137` après le délai de 10 s (`sleep` en PID 1 ignore SIGTERM par défaut ⇒ SIGKILL ⇒ 137).

## Lab 2.5
```bash
docker system df
docker container prune
docker image prune -a
```
`docker system prune -a --volumes` supprime conteneurs arrêtés, réseaux inutilisés, **toutes** les images non utilisées, le cache de build **et les volumes non utilisés** (donc des données).
