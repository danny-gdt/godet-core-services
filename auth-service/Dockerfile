# /godet-services/auth-service/Dockerfile

# --- STAGE 1: Builder ---
# Installe les dépendances de développement et compile le code TypeScript
FROM node:18-alpine3.18 AS builder

WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Configurer pnpm pour utiliser le registre npm officiel avec des options robustes
RUN pnpm config set registry https://registry.npmjs.org/
RUN pnpm config set fetch-retries 5
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 120000

# Copier les manifests et le schéma Prisma
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copier le reste du code source pour la compilation (y compris tsconfig.json)
COPY auth-service/ ./auth-service/

# Installer TOUTES les dépendances (y compris dev) pour avoir accès à TypeScript
# Le script postinstall génère le client Prisma, ce qui est bien mais sera refait en prod
RUN pnpm install --filter auth-service --frozen-lockfile


# Builder le projet (tsc)
RUN pnpm --filter auth-service run build


# --- STAGE 2: Production ---
# Crée l'image finale, optimisée, avec uniquement les dépendances de production
FROM node:18-alpine3.18

# Installer la dépendance OpenSSL requise par Prisma
RUN apk add --no-cache openssl1.1-compat

ENV NODE_ENV=production
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Configurer pnpm pour utiliser le registre npm officiel avec des options robustes
RUN pnpm config set registry https://registry.npmjs.org/
RUN pnpm config set fetch-retries 5
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 120000

# Copier les manifests et le schéma pour l'installation de production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY auth-service/package.json ./auth-service/
COPY auth-service/prisma ./auth-service/prisma/

# Installer UNIQUEMENT les dépendances de production.
# Le script `postinstall` ("prisma generate") est exécuté ici, ce qui garantit
# que le client Prisma est généré correctement pour l'environnement final.
RUN pnpm install --filter auth-service --frozen-lockfile

# Copier le code JavaScript compilé dans son répertoire d'origine
COPY --from=builder /app/auth-service/dist ./auth-service/dist

# Lancer le serveur depuis son emplacement d'origine, ce qui assure la résolution des modules
CMD [ "node", "auth-service/dist/server.js" ]