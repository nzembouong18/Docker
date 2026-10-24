# Labos — Module 12

## Lab 12.1 — Healthchecks de qualité (30 min)
Pour l'API Flask du module 09 :
1. Ajoutez un endpoint `/live` (processus vivant) et `/ready` (DB + Redis joignables).
2. Configurez le healthcheck sur `/ready` avec `start_period` adapté.
3. Arrêtez Postgres : combien de temps avant `unhealthy` ? Quelle est l'influence de `interval`/`retries` ?
4. Mettez en place un redémarrage automatique des conteneurs `unhealthy` (image `willfarrell/autoheal` avec le label `autoheal=true`).

## Lab 12.2 — Logs structurés & centralisés (45 min)
1. Modifiez l'application pour émettre des logs JSON (niveau, message, id de requête).
2. Lancez la stack `monitoring/` et la stack du module 09.
3. Dans Grafana/Loki, écrivez des requêtes LogQL : toutes les erreurs, le taux d'erreurs par minute, les requêtes de plus de 500 ms (si vous ajoutez la durée).
4. Configurez la rotation sur tous les services de la stack (`x-logging` avec ancre YAML).

## Lab 12.3 — Dashboard Grafana (45 min)
Créez un dashboard « Conteneurs » avec : CPU par conteneur, mémoire vs limite, réseau in/out, nombre de redémarrages, conteneurs `unhealthy`. Exportez-le en JSON et versionnez-le dans `grafana/provisioning/dashboards/`.

## Lab 12.4 — Alertes (40 min)
Ajoutez Alertmanager (webhook vers un petit serveur de réception ou un canal Slack/Mattermost) et 3 règles : mémoire > 90 % de la limite pendant 5 min, redémarrage répété, cAdvisor injoignable. Déclenchez-les à tour de rôle.

## Lab 12.5 — Métriques applicatives (30 min)
Exposez `/metrics` avec `prometheus_client` (compteur de requêtes par code, histogramme de latence). Ajoutez le job à `prometheus.yml` et tracez le taux d'erreurs et la latence p95.

> Corrigés : [solutions.md](solutions.md)
