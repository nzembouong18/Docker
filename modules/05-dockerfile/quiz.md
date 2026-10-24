# Quiz — Module 05

1. Pourquoi copier `requirements.txt` avant le code ?
2. Quelle est la différence entre `ARG` et `ENV` ?
3. Pourquoi préférer `CMD ["node","app.js"]` à `CMD node app.js` ?
4. `RUN rm bigfile` dans une couche suivante réduit-il la taille ?
5. À quoi sert `.dockerignore` ?
6. `EXPOSE` publie-t-il un port ?
7. Que donne `ENTRYPOINT ["echo","a"]` + `CMD ["b"]` avec `docker run img c` ?
8. Pourquoi ne pas mettre un secret dans `ENV` ?
9. Quand préférer `COPY` à `ADD` ?

<details><summary>Réponses</summary>

1. Pour réutiliser le cache de l'installation des dépendances quand seul le code change. — 2. `ARG` n'existe qu'au build ; `ENV` persiste dans l'image et à l'exécution. — 3. La forme exec fait du programme le PID 1 (signaux reçus) ; la forme shell met `sh` en PID 1. — 4. Non : la couche précédente contient toujours le fichier. — 5. Réduire le contexte, éviter les fuites de secrets, préserver le cache. — 6. Non, c'est documentaire. — 7. `a c` (CMD remplacé). — 8. Visible par `docker history`/`inspect` pour quiconque a l'image. — 9. Presque toujours : `COPY` est explicite.
</details>
