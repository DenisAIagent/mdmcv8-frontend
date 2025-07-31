# Dockerfile simple pour Railway
FROM node:18-alpine

# Installer les dépendances système pour imagemin et gifsicle
RUN apk add --no-cache \
    autoconf \
    automake \
    libtool \
    make \
    g++ \
    libpng-dev \
    nasm \
    pkgconfig \
    python3 \
    py3-pip

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (dev incluses pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Build de production
RUN npm run build

# Nettoyer les devDependencies après le build
RUN npm prune --production

# Exposer le port (Railway utilise PORT dynamique)
EXPOSE $PORT

# Démarrer avec serveur Express
CMD ["npm", "start"]