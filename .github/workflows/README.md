# Configuration GitHub Actions pour AWS ECS

Ce guide explique comment configurer les secrets GitHub nécessaires pour le déploiement automatique sur AWS ECS.

## Secrets GitHub requis

Ajoutez ces secrets dans votre repository GitHub : `Settings` > `Secrets and variables` > `Actions`

### 1. AWS Credentials
- `AWS_ACCESS_KEY_ID` - Clé d'accès AWS
- `AWS_SECRET_ACCESS_KEY` - Clé secrète AWS

### 2. AWS Network Configuration
- `SUBNET_IDS` - IDs des sous-réseaux (format: `subnet-12345678,subnet-87654321`)
- `SECURITY_GROUP_IDS` - IDs des groupes de sécurité (format: `sg-12345678`)

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
        "ecs:DescribeTasks"
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
    }
  ]
}
```

## Variables d'environnement du workflow

Modifiez ces variables dans le fichier `.github/workflows/deploy.yml` selon votre configuration :

```yaml
env:
  AWS_REGION: us-east-1                    # Votre région AWS
  ECR_REPOSITORY: auth-service            # Nom de votre repository ECR
  ECS_CLUSTER: godet-services-cluster     # Nom de votre cluster ECS
  ECS_SERVICE: auth-service               # Nom de votre service ECS
```

## Déclenchement du workflow

Le workflow se déclenche automatiquement sur :
- Push sur les branches `main` ou `master`
- Pull Request sur les branches `main` ou `master`

## Étapes du workflow

1. **Test** - Exécute les tests de l'application
2. **Build** - Construit l'image Docker
3. **Push ECR** - Pousse l'image vers Amazon ECR
4. **Déploiement ECS** - Met à jour le service ECS
5. **Migrations** - Exécute les migrations de base de données
6. **Notification** - Notifie le statut du déploiement

## Monitoring

- Surveillez les déploiements dans l'onglet `Actions` de GitHub
- Consultez les logs ECS dans AWS Console
- Vérifiez les logs CloudWatch pour le debugging 