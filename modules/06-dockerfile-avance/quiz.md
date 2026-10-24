# Quiz — Module 06

1. Quel est l'intérêt principal du multi-stage ?
2. Comment s'arrêter à une étape nommée `build` ?
3. Que permet `RUN --mount=type=cache` ?
4. Pourquoi `--mount=type=secret` est-il plus sûr que `ARG` ?
5. Citez deux inconvénients de `scratch`/distroless.
6. Quelles variables permettent la compilation croisée dans un Dockerfile ?
7. À quoi sert `--cache-to type=registry` ?
8. Que contient un SBOM ?

<details><summary>Réponses</summary>

1. Séparer build et runtime : image finale petite, moins de surface d'attaque. — 2. `docker build --target build .` — 3. Persister un cache (pip, apt, go, npm) entre les builds sans l'inclure dans l'image. — 4. Il n'est monté qu'à l'exécution du `RUN` et n'est écrit dans aucune couche ni dans `history`. — 5. Pas de shell (debug difficile), pas de certificats/tzdata par défaut (scratch), nécessité d'un binaire statique. — 6. `BUILDPLATFORM`, `TARGETOS`, `TARGETARCH`, `TARGETPLATFORM`. — 7. Exporter le cache de build vers un registre pour le réutiliser entre runners CI. — 8. La liste des composants/paquets/versions de l'image (Software Bill of Materials).
</details>
