# Support de cours PowerPoint — Docker, du débutant à l'expert

Auteur : **NZEMBOUONG Patrick**, Ingénieur DevOps Kubernetes.

- Fichier : [`Docker-du-debutant-a-l-expert.pptx`](Docker-du-debutant-a-l-expert.pptx) : 99 diapositives, avec notes de l'orateur sur chaque diapositive.
- Il suit les 16 modules du dépôt (`../modules/`) : mêmes exemples, mêmes commandes, mêmes résultats vérifiés.
- Structure : 16 sections (une par module) + ouverture + conclusion. Thème, mises en page et sections PowerPoint : le style se change en un seul endroit.

## Régénérer le fichier

```bash
cd support-de-cours/build
npm install            # pptxgenjs, react-icons, sharp, react, react-dom
node build.js          # écrit ../Docker-du-debutant-a-l-expert.pptx
```

Le script `build.js` s'appuie sur le module `apply_theme.js` d'un skill « pptx » pour écrire les couleurs du thème ; si vous ne l'avez pas, passez `PPTX_SKILL_DIR=<dossier>` ou retirez l'appel `applyTheme` (les couleurs du thème resteront celles d'Office).

Contenu des fichiers : `lib.js` (thème, mises en page, composants), `part1.js` (ouverture, modules 01-04), `part2.js` (05-09), `part3.js` (10-15 et conclusion).
