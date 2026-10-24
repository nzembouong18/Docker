# Quiz — Module 11

1. Pourquoi monter `docker.sock` dans un conteneur est-il critique ?
2. Que fait `--cap-drop ALL` ?
3. Pourquoi `--privileged` est-il à proscrire ?
4. Comment le FS en lecture seule réduit-il l'impact d'une intrusion ?
5. Citez 3 façons de fournir un secret et classez-les.
6. Que prouve une signature cosign ? un SBOM ? une provenance ?
7. Que change le mode rootless ?
8. Une CVE CRITICAL est détectée mais non exploitable dans votre contexte : que faites-vous ?

<details><summary>Réponses</summary>

1. Il donne le contrôle du démon (root hôte). — 2. Retire toutes les capabilities Linux du conteneur. — 3. Désactive presque toutes les protections et expose les périphériques de l'hôte. — 4. L'attaquant ne peut pas écrire d'outils ni modifier les binaires. — 5. Fichier monté / gestionnaire externe (bon), variable d'environnement (moyen), dans l'image (mauvais). — 6. Origine/intégrité ; composition de l'image ; comment/où elle a été construite. — 7. Le démon et les conteneurs tournent sans root hôte ; root du conteneur ≠ root hôte. — 8. Documenter (VEX), prioriser, mettre à jour dès qu'un correctif existe ; ne pas ignorer silencieusement.
</details>
