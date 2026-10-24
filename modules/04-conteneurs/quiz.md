# Quiz — Module 04

1. Quel signal envoie `docker stop` en premier ? Et après le délai ?
2. Pourquoi un processus en PID 1 peut-il ignorer SIGTERM ?
3. Que fait `--init` ?
4. `EXPOSE 80` publie-t-il le port 80 ?
5. Quelle option protège des fork bombs ?
6. Que signifie `OOMKilled=true` ?
7. Pourquoi loguer sur stdout plutôt que dans un fichier ?
8. Différence entre `always` et `unless-stopped` ?
9. Que fait `docker exec` par rapport à `docker attach` ?

<details><summary>Réponses</summary>

1. SIGTERM puis SIGKILL — 2. Le noyau n'applique pas les actions de signal par défaut au PID 1 d'un namespace ; sans handler explicite, le signal est ignoré — 3. Lance `tini` en PID 1 : transmet les signaux et récolte les zombies — 4. Non, documentaire seulement — 5. `--pids-limit` — 6. Le noyau a tué le conteneur pour dépassement mémoire — 7. Docker collecte stdout/stderr ; les fichiers grossissent, ne sont pas centralisés et se perdent — 8. `unless-stopped` ne redémarre pas un conteneur arrêté manuellement après reboot du démon — 9. `exec` lance un nouveau processus ; `attach` se branche sur le PID 1.
</details>
