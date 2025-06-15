# Configuration GitHub Actions pour AWS ECS avec AWS Secrets Manager

Ce guide explique comment configurer les secrets GitHub nécessaires pour le déploiement automatique sur AWS ECS en utilisant AWS Secrets Manager.

## Secrets GitHub requis

Ajoutez ces secrets dans votre repository GitHub : `Settings` > `Secrets and variables` > `Actions`

### 1. AWS Credentials
- `AWS_ACCESS_KEY_ID` - Clé d'accès AWS
- `AWS_SECRET_ACCESS_KEY` - Clé secrète AWS

### 2. AWS Configuration
- `AWS_ACCOUNT_ID` - ID de votre compte AWS (12 chiffres)
- `AWS_SECRETS_MANAGER_ARN` - ARN du secret principal dans AWS Secrets Manager
- `SUBNET_IDS` - IDs des sous-réseaux ECS (séparés par des virgules)
- `SECURITY_GROUP_IDS` - IDs des groupes de sécurité ECS (séparés par des virgules)

## Configuration AWS Secrets Manager

Créez un secret principal dans AWS Secrets Manager avec la structure suivante :

### Secret principal : `auth-service-secrets`
```json
{
  "database-url": "postgresql://username:password@your-rds-instance.region.rds.amazonaws.com:5432/database_name?schema=public&sslmode=require",
  "redis-url": "redis://your-elasticache-endpoint.region.cache.amazonaws.com:6379",
  "frontend-url": "https://your-frontend-domain.com",
  "access-token-secret": "your-super-secure-access-token-secret",
  "refresh-token-secret": "your-super-secure-refresh-token-secret"
}
```

L'ARN de ce secret sera utilisé comme `AWS_SECRETS_MANAGER_ARN` dans les secrets GitHub.

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
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:region:account:secret:auth-service-secrets*"
      ]
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
  ECS_SERVICE: godet-auth-service         # Nom de votre service ECS
```

## Configuration ECS

### 1. Fichier ecs-task-definition.json

Le fichier `ecs-task-definition.json` définit la configuration de la task ECS :
- **Image** : Remplacée dynamiquement par l'URI de l'image ECR
- **Secrets** : Récupérés depuis AWS Secrets Manager
- **Réseau** : Configuration VPC et sous-réseaux
- **Ressources** : CPU et mémoire pour le service
- **Logs** : Configuration CloudWatch Logs

### 2. Rôles IAM ECS

Assurez-vous que les rôles suivants existent dans votre compte AWS :
- `ecsTaskExecutionRole` - Pour l'exécution des tâches ECS
- `ecsTaskRole` - Pour les permissions de l'application

## Déclenchement du workflow

Le workflow se déclenche automatiquement sur :
- Push sur la branche `main`
- Pull Request sur la branche `main`

## Étapes du workflow

1. **Build** - Construit l'image Docker
2. **Push ECR** - Pousse l'image vers Amazon ECR
3. **Préparation Task Definition** - Remplace les placeholders dans le fichier JSON
4. **Déploiement ECS** - Déploie la task definition sur ECS
5. **Stabilité** - Attend que le service soit stable
6. **Migrations** - Exécute les migrations de base de données
7. **Notification** - Notifie le statut du déploiement

## Avantages de cette approche

- **Sécurité renforcée** : Secrets centralisés dans AWS Secrets Manager
- **Rotation automatique** : Possibilité de rotation automatique des secrets
- **Audit** : Traçabilité complète des accès aux secrets
- **Simplicité** : Configuration JSON claire et maintenable
- **Flexibilité** : Facile de modifier la configuration sans changer le code
- **Intégration native** : Utilise les fonctionnalités natives d'ECS

## Monitoring

- Surveillez les déploiements dans l'onglet `Actions` de GitHub
- Consultez les logs ECS dans AWS Console
- Vérifiez les logs CloudWatch pour le debugging
- Surveillez l'accès aux secrets dans AWS CloudTrail
- Vérifiez l'état des services dans la console ECS 