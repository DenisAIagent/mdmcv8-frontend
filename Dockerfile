# Dockerfile simple pour Railway
# Use Node 20 to satisfy engine requirements of some deps (cheerio/undici)
FROM node:20-alpine

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
# npm ci requires lockfile to be exactly in sync; in CI this is desired.
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