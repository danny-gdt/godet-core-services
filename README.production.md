# Configuration de Production AWS ECS avec ELK Stack

Ce guide explique comment déployer l'application en production sur AWS ECS avec ElastiCache, RDS et ELK stack intégré.

## Architecture AWS ECS

- **ECS (Elastic Container Service)** - Orchestration des conteneurs
- **RDS (Relational Database Service)** - Base de données PostgreSQL
- **ElastiCache** - Cache Redis
- **ELK Stack sur ECS** - Elasticsearch, Logstash, Kibana intégrés
- **AWS Secrets Manager** - Gestion sécurisée des secrets

## Prérequis

1. **AWS ECS Cluster** - Pour l'orchestration des conteneurs
2. **AWS RDS** - Instance PostgreSQL
3. **AWS ElastiCache** - Cluster Redis
4. **AWS ECR** - Registry pour les images Docker
5. **AWS Application Load Balancer** - Pour exposer les services

## Configuration

### 1. Configuration AWS RDS

1. Créez une instance PostgreSQL dans AWS RDS
2. Notez l'endpoint de l'instance
3. Créez un utilisateur de base de données avec les permissions nécessaires

### 2. Configuration AWS ElastiCache

1. Créez un cluster Redis dans AWS ElastiCache
2. Notez l'endpoint du cluster
3. Configurez les groupes de sécurité appropriés

### 3. Configuration ELK Stack

L'ELK stack est déployé directement dans ECS :
- **Elasticsearch** - Stockage et indexation des logs
- **Logstash** - Traitement et transformation des logs
- **Kibana** - Interface de visualisation et analyse

### 4. Variables d'environnement

Copiez le fichier `env.prod.example` vers `env.prod` et configurez les variables :

```bash
cp env.prod.example env.prod
```

Modifiez `env.prod` avec vos vraies valeurs :

```env
# AWS RDS
DATABASE_URL="postgresql://username:password@your-rds-instance.region.rds.amazonaws.com:5432/database_name?schema=public&sslmode=require"

# AWS ElastiCache
REDIS_URL="redis://your-elasticache-endpoint.region.cache.amazonaws.com:6379"

# Application
FRONTEND_URL="https://your-frontend-domain.com"
ACCESS_TOKEN_SECRET="your-super-secure-access-token-secret"
REFRESH_TOKEN_SECRET="your-super-secure-refresh-token-secret"
```

## Déploiement

### 1. Build et push des images

```bash
# Build de l'image
docker build -t auth-service:latest -f auth-service/Dockerfile .

# Tag pour ECR
docker tag auth-service:latest your-account.dkr.ecr.region.amazonaws.com/auth-service:latest

# Push vers ECR
docker push your-account.dkr.ecr.region.amazonaws.com/auth-service:latest
```

### 2. Déploiement sur ECS

```bash
# Déploiement avec ECS CLI ou AWS Console
aws ecs update-service --cluster your-cluster --service godet-services --force-new-deployment
```

### 3. Exécuter les migrations

```bash
# Via ECS Task Definition ou directement sur l'instance
pnpm prod:migrate
```

## Monitoring avec ELK Stack

Les logs sont automatiquement envoyés vers Elasticsearch via Logstash en utilisant le protocole GELF. Vous pouvez :

1. **Accéder à Kibana** sur `http://your-alb-domain:5601`
2. **Créer des dashboards** pour visualiser les logs
3. **Configurer des alertes** basées sur les logs
4. **Analyser les performances** de l'application
5. **Rechercher dans les logs** avec des requêtes avancées

### Configuration Logstash avec GELF

Le fichier `logstash/pipeline.prod.conf` configure :
- **Entrée GELF** : Réception des logs via le protocole GELF sur le port UDP 12201
- **Parsing JSON** : Extraction des champs JSON des logs Pino
- **Métadonnées** : Ajout automatique de l'environnement et du service
- **Extraction des données HTTP** : Méthode, URL, statut, temps de réponse
- **Envoi vers Elasticsearch** : Avec template personnalisé et indexation par date

### Services exposés

- **Auth Service** : `http://your-alb-domain:3000`
- **Kibana** : `http://your-alb-domain:5601`
- **Elasticsearch** : `http://your-alb-domain:9200`

## Sécurité

- Utilisez des secrets forts pour les tokens JWT
- Configurez SSL/TLS pour toutes les connexions
- Utilisez des groupes de sécurité AWS appropriés
- Limitez l'accès aux services AWS aux seules adresses IP nécessaires
- Utilisez AWS Secrets Manager pour les secrets sensibles
- Configurez VPC et sous-réseaux privés
- Sécurisez l'accès à Kibana avec authentification

## Maintenance

### Mise à jour de l'application

```bash
# Build et push de la nouvelle image
docker build -t auth-service:latest -f auth-service/Dockerfile .
docker tag auth-service:latest your-account.dkr.ecr.region.amazonaws.com/auth-service:latest
docker push your-account.dkr.ecr.region.amazonaws.com/auth-service:latest

# Déploiement sur ECS
aws ecs update-service --cluster your-cluster --service godet-services --force-new-deployment
```

### Sauvegarde

- AWS RDS effectue automatiquement des sauvegardes
- Configurez des sauvegardes supplémentaires si nécessaire
- Testez régulièrement la restauration des sauvegardes
- Configurez la réplication cross-region pour la haute disponibilité
- Sauvegardez les données Elasticsearch si nécessaire 