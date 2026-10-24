# Quiz — Module 14

1. Quel composant crée réellement le conteneur ? Quel est le rôle du shim ?
2. Citez 5 types de namespaces.
3. Qu'indique `nr_throttled` dans `cpu.stat` ?
4. Qu'est-ce que le copy-up d'overlayfs ?
5. À quoi sert `nsenter` ?
6. Pourquoi `exec format error` apparaît-il ?
7. Que permet `live-restore` ?
8. Pourquoi `pivot_root` est-il préférable à `chroot` ?
9. Décrivez en 5 étapes une méthodologie de dépannage.

<details><summary>Réponses</summary>

1. `runc` ; le shim garde les flux et l'état du processus et permet de redémarrer containerd/dockerd sans tuer le conteneur. — 2. mnt, pid, net, ipc, uts, user, cgroup, time. — 3. Le nombre de périodes où le conteneur a été bridé par sa limite CPU. — 4. Copie du fichier entier depuis une couche basse vers la couche inscriptible lors de la première écriture. — 5. Entrer dans les namespaces d'un processus en utilisant les outils de l'hôte. — 6. Mauvaise architecture, binaire invalide, shebang avec CRLF. — 7. Redémarrer/mettre à jour dockerd sans arrêter les conteneurs. — 8. Il change réellement la racine du montage et permet de démonter l'ancienne ; `chroot` peut être contourné. — 9. Décrire → état (inspect/events) → logs → reproduire → ressources/processus (strace) en isolant une variable à la fois.
</details>
