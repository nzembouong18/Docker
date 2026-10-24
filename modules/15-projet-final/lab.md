# Labo — Module 15

Le projet est décrit dans le [README du module](README.md). Ce fichier précise la **méthode de travail**.

## Organisation conseillée (6 h)

| Temps | Activité |
|-------|----------|
| 0 h 15 | Lire le code, lancer `make up`, `make smoke`, explorer chaque conteneur |
| 1 h 00 | Jalon 1 : image |
| 1 h 30 | Jalon 2 : données & Compose |
| 1 h 30 | Jalon 3 : CI/CD |
| 1 h 00 | Jalon 4 : sécurité |
| 0 h 45 | Jalon 5 : observabilité |

## Règles
- Un commit par tâche cochée, message explicite.
- Chaque affirmation (« non-root », « db isolée ») est **prouvée par une commande** consignée dans votre rapport.
- Travaillez sur une branche `projet/<prenom>` et ouvrez une PR vers `main` ; la CI doit être verte.

## Exercices de panne (à faire avant la démo)
1. Supprimez le volume `pgdata` : que se passe-t-il ? Rétablissez depuis votre sauvegarde.
2. Mettez un mauvais `POSTGRES_PASSWORD` : repérez l'erreur dans les logs en moins de 2 minutes.
3. Poussez volontairement une image cassée (route `/ready` qui renvoie 500) : la CI/CD empêche-t-elle le déploiement ? Sinon, ajoutez le garde-fou.
4. Saturez la mémoire de l'API (`mem_limit: 32m` + charge) : constatez l'OOM, ajustez.

## Auto-évaluation finale
Cochez ce que vous savez faire **sans aide** :
- [ ] Expliquer le chemin `docker run` → runc
- [ ] Écrire un Dockerfile multi-stage sécurisé
- [ ] Concevoir une stack Compose avec réseaux, volumes, secrets, healthchecks
- [ ] Construire une CI qui teste, scanne, signe et publie
- [ ] Diagnostiquer un conteneur qui ne démarre pas / est tué / est lent
- [ ] Choisir et justifier une plateforme de production

> Pistes de correction : [solutions.md](solutions.md)
