# Préparer la certification Docker Certified Associate (DCA)

> Les modalités de l'examen évoluent : vérifiez le programme officiel sur le site de Docker/Mirantis avant de vous inscrire. Cette annexe relie les domaines classiques de l'examen aux modules de la formation.

| Domaine | Thèmes | Modules |
|---------|--------|---------|
| Orchestration | Swarm, services, stacks, secrets, quorum, réseaux overlay | 08, 13 |
| Création d'images | Dockerfile, bonnes pratiques, multi-stage, registre | 03, 05, 06 |
| Installation & configuration | Installation, `daemon.json`, drivers de stockage/logs, rootless | 02, 11, 14 |
| Réseau | bridge/overlay/host/macvlan, publication de ports, DNS | 08 |
| Sécurité | Content trust, scan, secrets, namespaces, capabilities, mTLS | 11 |
| Stockage & volumes | Volumes, bind, tmpfs, drivers, clustering | 07 |

## Plan de révision (4 semaines)
1. **Semaine 1** : modules 01-04 + quiz ; refaire les labos sans solution.
2. **Semaine 2** : modules 05-08 ; construire 5 images différentes, 3 réseaux, sauvegarder/restaurer un volume.
3. **Semaine 3** : modules 09-12 ; stack Compose complète avec CI et scan.
4. **Semaine 4** : modules 13-14 ; cluster Swarm 3 nœuds, pannes, mise à jour/rollback ; examens blancs.

## Points fréquemment testés
- Différence `CMD`/`ENTRYPOINT`, `COPY`/`ADD`, `ARG`/`ENV`.
- Commandes Swarm : `init`, `join-token`, `service create/update/scale/rollback`, `node update --availability`, `secret create`, `stack deploy`.
- Quorum Raft (3 managers → 1 panne tolérée).
- Placement : contraintes, préférences, mode global vs répliqué.
- Réseaux overlay et ports (2377, 7946, 4789).
- Drivers de logs, `json-file` vs `local`, limites de ressources.
- Sécurité : `docker trust`, scan, secrets, capabilities, userns-remap.
- Dépannage : `docker inspect`, `docker events`, journaux du démon.

## Conseils
- Pratiquez en ligne de commande, sans interface graphique.
- Sachez lire une sortie `docker inspect` et la requêter avec `--format`.
- Chronométrez-vous : les questions pratiques sont courtes.
