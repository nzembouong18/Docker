# Quiz — Module 07

1. Que devient la couche inscriptible quand on supprime un conteneur ?
2. Différence volume / bind mount ?
3. Quand utiliser tmpfs ?
4. Un volume vide monté sur un dossier non vide de l'image : que se passe-t-il ? Et un bind mount ?
5. Comment sauvegarder un volume ?
6. Pourquoi la sauvegarde à chaud des fichiers d'une base est risquée ?
7. Pourquoi évite-t-on `VOLUME` dans un Dockerfile ?
8. À quoi sert le suffixe `:Z` ?

<details><summary>Réponses</summary>

1. Elle est supprimée avec le conteneur. — 2. Le volume est géré par Docker (portable, drivers) ; le bind mount expose un chemin précis de l'hôte. — 3. Données temporaires ou sensibles à garder en RAM. — 4. Le volume reçoit une copie du contenu de l'image ; le bind mount masque ce contenu. — 5. Conteneur éphémère + `tar`, ou dump applicatif. — 6. Fichiers incohérents pendant l'écriture (pas de snapshot). — 7. Volumes anonymes, comportement surprenant, empêche de modifier le dossier plus tard. — 8. Étiquette SELinux privée pour autoriser l'accès au bind mount.
</details>
