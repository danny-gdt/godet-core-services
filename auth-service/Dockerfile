# /godet-services/auth-service/Dockerfile

FROM node:18-alpine

# On définit le répertoire de travail
WORKDIR /app

# On copie UNIQUEMENT les package.json du projet qui nous intéressent
# `pnpm` a besoin du fichier de la racine et du workspace courant
COPY package.json pnpm-lock.yaml ./
COPY auth-service/package.json ./auth-service/

# On installe UNIQUEMENT les dépendances de production pour ce workspace
# L'option --prod est cruciale
RUN pnpm install --prod --frozen-lockfile

# On copie le reste du code du service
COPY auth-service/ ./auth-service/

# On copie le schéma prisma pour pouvoir générer le client
COPY prisma/ ./prisma/
RUN pnpm -F auth-service exec prisma generate

# Commande pour lancer le service
CMD [ "pnpm", "-F", "auth-service", "run", "start" ]