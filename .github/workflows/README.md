# Configuration GitHub Actions pour AWS ECS avec Docker Compose

Ce guide explique comment configurer les secrets GitHub nécessaires pour le déploiement automatique sur AWS ECS en utilisant Docker Compose.

## Secrets GitHub requis

Ajoutez ces secrets dans votre repository GitHub : `Settings` > `Secrets and variables` > `Actions`

### 1. AWS Credentials
- `AWS_ACCESS_KEY_ID` - Clé d'accès AWS
- `AWS_SECRET_ACCESS_KEY` - Clé secrète AWS

### 2. Application Secrets
- `DATABASE_URL` - URL de connexion à la base de données RDS
- `REDIS_URL` - URL de connexion à ElastiCache Redis
- `FRONTEND_URL` - URL du frontend en production
- `ACCESS_TOKEN_SECRET` - Secret pour les tokens JWT d'accès
- `REFRESH_TOKEN_SECRET` - Secret pour les tokens JWT de rafraîchissement

## Configuration AWS IAM

Créez un utilisateur IAM avec les permissions suivantes :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:RunTask",
        "ecs:StopTask",
        "ecs:DescribeTasks",
        "ecs:CreateService",
        "ecs:DeleteService"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/ecsTaskExecutionRole",
        "arn:aws:iam::*:role/ecsTaskRole"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Variables d'environnement du workflow

Modifiez ces variables dans le fichier `.github/workflows/deploy.yml` selon votre configuration :

```yaml
env:
  AWS_REGION: eu-west-3                    # Votre région AWS
  ECR_REPOSITORY: godet-core-services     # Nom de votre repository ECR
  ECS_CLUSTER: godet-core-services-cluster # Nom de votre cluster ECS
```

## Configuration ECS

### 1. Fichier ecs-params.yml

Le fichier `ecs-params.yml` configure les paramètres ECS spécifiques :

- **Réseau** : Configuration VPC et sous-réseaux
- **Ressources** : CPU et mémoire pour chaque service
- **Logs** : Configuration CloudWatch Logs
- **Rôles IAM** : Permissions d'exécution

### 2. Docker Compose

Le fichier `docker-compose.prod.yml` définit tous les services :
- **auth-service** - Application principale
- **elasticsearch** - Stockage des logs
- **logstash** - Traitement des logs
- **kibana** - Interface de visualisation

## Déclenchement du workflow

Le workflow se déclenche automatiquement sur :
- Push sur la branche `main`
- Pull Request sur la branche `main`

## Étapes du workflow

1. **Test** - Exécute les tests de l'application
2. **Build** - Construit l'image Docker
3. **Push ECR** - Pousse l'image vers Amazon ECR
4. **Création Task Definition** - Convertit docker-compose en task definition ECS
5. **Déploiement** - Déploie les services sur ECS
6. **Migrations** - Exécute les migrations de base de données
7. **Notification** - Notifie le statut du déploiement

## Avantages de cette approche

- **Configuration unique** : Un seul fichier docker-compose pour tous les environnements
- **Cohérence** : Même configuration en local et en production
- **Simplicité** : Pas besoin de maintenir des task definitions séparées
- **Flexibilité** : Facile d'ajouter ou modifier des services

## Monitoring

- Surveillez les déploiements dans l'onglet `Actions` de GitHub
- Consultez les logs ECS dans AWS Console
- Vérifiez les logs CloudWatch pour le debugging
- Accédez à Kibana pour l'analyse des logs 