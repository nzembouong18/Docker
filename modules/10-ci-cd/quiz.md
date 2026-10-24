# Quiz — Module 10

1. Pourquoi « build once, deploy many » ?
2. Quel tag garantit l'immuabilité et la traçabilité ?
3. À quoi sert `docker compose up --wait` en CI ?
4. Quel est le risque de monter `docker.sock` dans un job CI ?
5. Pourquoi un cache distant est-il nécessaire sur des runners éphémères ?
6. Qu'apporte une signature cosign ?
7. Comment effectuer un rollback ?

<details><summary>Réponses</summary>

1. L'artefact testé est exactement celui déployé ; seule la config change. — 2. Le SHA du commit ou le digest. — 3. Attendre que les healthchecks soient OK avant les tests. — 4. Donne un accès root à l'hôte (le job contrôle le démon). — 5. Chaque runner repart d'un état vide. — 6. Preuve d'origine/intégrité de l'image, vérifiable avant déploiement. — 7. Redéployer le tag ou digest précédent (déploiement piloté par version).
</details>
