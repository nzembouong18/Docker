# Quiz — Module 03

1. Une image est-elle modifiable une fois construite ?
2. Différence entre tag et digest ?
3. Que signifie une image « dangling » ?
4. Pourquoi deux images basées sur `debian:bookworm-slim` prennent-elles moins de place que la somme de leurs tailles ?
5. Quel est le registre par défaut ?
6. Quelle variante d'image est la plus petite : `slim`, `alpine`, `scratch` ?
7. Pourquoi `docker commit` est-il déconseillé pour produire des images ?
8. Comment pousser `monapp` vers `ghcr.io/org/monapp:1.0` ?

<details><summary>Réponses</summary>

1. Non, les couches sont immuables ; on en crée une nouvelle. — 2. Le tag est un pointeur mutable lisible ; le digest est l'empreinte immuable du contenu. — 3. Image sans tag (`<none>`), non référencée. — 4. Les couches communes sont partagées (stockées une seule fois). — 5. Docker Hub (`docker.io`). — 6. `scratch` (vide) — 7. Non reproductible, non versionné, opaque. — 8. `docker tag monapp ghcr.io/org/monapp:1.0 && docker push ghcr.io/org/monapp:1.0` après `docker login ghcr.io`.
</details>
