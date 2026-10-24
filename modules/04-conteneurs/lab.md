# Labos — Module 04

## Lab 4.1 — Arrêt propre (20 min)
1. Écrivez un petit script (Python ou Node) qui boucle et affiche un message à la réception de SIGTERM avant de quitter avec le code 0.
2. Lancez-le dans un conteneur, mesurez la durée de `docker stop`.
3. Retirez le handler : que devient la durée ? Corrigez ensuite **sans toucher au code** avec `--init`.

## Lab 4.2 — Contrôle des ressources (20 min)
1. Lancez un conteneur `alpine` limité à 100 Mo, 0,5 CPU et 50 processus.
2. Prouvez chaque limite : boucle CPU, allocation mémoire (python), fork bomb contrôlée (`for i in $(seq 100); do sleep 100 & done`).
3. Relevez les valeurs dans `/sys/fs/cgroup/` (memory.max, cpu.max, pids.max).

## Lab 4.3 — Résilience (15 min)
1. Lancez nginx avec `--restart unless-stopped`.
2. Tuez le processus principal depuis l'hôte (`docker kill`/`kill <pid>`). Que se passe-t-il ?
3. Redémarrez le démon Docker (`sudo systemctl restart docker`). Le conteneur revient-il ? Comparez avec `--restart no`.

## Lab 4.4 — Logs maîtrisés (15 min)
1. Générez des logs en continu avec une rotation 2 fichiers × 100 Ko.
2. Vérifiez le plafonnement sur disque.
3. Affichez uniquement les logs des 30 dernières secondes avec horodatage.

## Lab 4.5 — Diagnostic (25 min)
Un enseignant lance des conteneurs « cassés » (copiez les commandes) ; trouvez la cause en moins de 3 minutes chacun :
```bash
docker run -d --name c1 alpine sh -c 'cat /nexiste/pas'
docker run -d --name c2 -m 6m python:3.12-alpine python -c 'x=bytearray(50*10**6)'
docker run -d --name c3 alpine /bin/notexe
docker run -d --name c4 nginx:alpine nginx -g 'invalide'
docker run -d --name c5 -p 8080:80 nginx:alpine && docker run -d --name c6 -p 8080:80 nginx:alpine
```
Pour chacun : code de sortie, cause, correctif.

> Corrigés : [solutions.md](solutions.md)
