# Quiz — Module 08

1. Pourquoi créer un réseau bridge utilisateur plutôt que d'utiliser le `bridge` par défaut ?
2. Que signifie `-p 127.0.0.1:8080:80` ?
3. Pour joindre `db` depuis `api` sur le même réseau, quelle adresse et quel port utiliser ?
4. À quoi sert `--internal` ?
5. Pourquoi `localhost` ne fonctionne pas pour joindre un autre conteneur ?
6. Quand utiliser `--network host` ?
7. Quel pilote permet de relier des conteneurs sur plusieurs hôtes ?
8. Pourquoi ufw ne protège pas toujours un port publié ?

<details><summary>Réponses</summary>

1. DNS par nom de conteneur, meilleure isolation, connexion à chaud. — 2. Publie le port 80 du conteneur uniquement sur l'interface locale de l'hôte. — 3. `db:<port interne>` (ex. `db:5432`). — 4. Réseau sans accès externe (pas de passerelle sortante). — 5. `localhost` désigne le conteneur lui-même. — 6. Performance ou outils réseau, sur Linux, quand l'isolation n'est pas requise. — 7. `overlay` (Swarm). — 8. Docker insère ses règles iptables avant celles d'ufw.
</details>
