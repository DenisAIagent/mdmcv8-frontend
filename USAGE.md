# Guide d'utilisation - Service SmartLinks MDMC

## 🚀 Démarrage immédiat

### Lancement du service

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Ajuster les variables dans .env

# Démarrage
npm start

# Tests
npm test
```

### URLs principales

- **Service** : `http://localhost:3001`
- **Health** : `http://localhost:3001/health`
- **API Test** : `http://localhost:3001/api/odesli/test`

## 🎵 Création de SmartLinks

### Méthode 1: API REST (recommandée)

```bash
# Génération automatique via Odesli
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sourceUrl": "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
    "customData": {
      "description": "Description personnalisée pour ce track"
    }
  }'

# Réponse
{
  "success": true,
  "message": "SmartLink HTML généré avec succès",
  "data": {
    "url": "https://smartlink.mdmcmusicads.com/artist/track",
    "filePath": "/public/smartlinks/artist/track.html"
  },
  "method": "odesli"
}
```

### Méthode 2: Script CLI

```bash
# Génération simple
npm run generate "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"

# Avec description personnalisée
npm run generate "https://music.apple.com/..." "Ma description custom"

# Génération des exemples par défaut
npm run generate
```

### Méthode 3: JavaScript SDK

```javascript
const StaticHtmlGenerator = require('./services/staticHtmlGenerator');

const htmlGenerator = new StaticHtmlGenerator();

// Génération depuis URL
const result = await htmlGenerator.generateFromUrl(
  'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
  {
    customData: {
      description: 'Description personnalisée'
    }
  }
);

console.log('SmartLink créé:', result.url);
```

## 🔗 URLs supportées

### Plateformes compatibles Odesli

- **Spotify** : `https://open.spotify.com/track/*`
- **Apple Music** : `https://music.apple.com/*`
- **YouTube Music** : `https://music.youtube.com/*`
- **Deezer** : `https://deezer.com/track/*`
- **Tidal** : `https://tidal.com/browse/track/*`
- **Amazon Music** : `https://music.amazon.com/*`
- **SoundCloud** : `https://soundcloud.com/*/*`
- **Bandcamp** : `https://*.bandcamp.com/track/*`

### Exemples d'URLs valides

```
https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC
https://music.apple.com/us/album/nevermind/1440783617?i=1440783849
https://music.youtube.com/watch?v=rYEDA3JcQqw
https://www.deezer.com/track/3135556
```

## 📋 Gestion des SmartLinks

### Statistiques

```bash
curl http://localhost:3001/api/stats

# Réponse
{
  "service": "MDMC SmartLinks",
  "stats": {
    "totalFiles": 5,
    "totalArtists": 3,
    "totalSize": "125 KB",
    "lastGenerated": "2025-08-03T23:30:28.535Z"
  }
}
```

### Mise à jour

```bash
curl -X PUT http://localhost:3001/api/update/artist-slug/track-slug \
  -H "Content-Type: application/json" \
  -d '{
    "trackTitle": "Nouveau titre",
    "description": "Nouvelle description"
  }'
```

### Suppression

```bash
curl -X DELETE http://localhost:3001/api/delete/artist-slug/track-slug
```

## 🎨 Personnalisation

### Template EJS

Le template `/templates/smartlink.ejs` peut être personnalisé :

```html
<!-- Métadonnées Open Graph -->
<meta property="og:title" content="<%= title %>">
<meta property="og:description" content="<%= description %>">
<meta property="og:image" content="<%= image %>">

<!-- Données dynamiques -->
<h1><%= track.title %></h1>
<h2><%= artist.name %></h2>

<!-- Liens plateformes -->
<% platforms.forEach(platform => { %>
  <a href="<%= platform.url %>">
    Écouter sur <%= platform.displayName %>
  </a>
<% }); %>
```

### Charte graphique

Variables CSS modifiables dans le template :

```css
:root {
  --primary-color: #E50914;      /* Rouge MDMC */
  --secondary-color: #141414;    /* Noir */
  --font-primary: 'Poppins';     /* Titres */
  --font-secondary: 'Inter';     /* Texte */
}
```

## 🔧 Configuration avancée

### Variables d'environnement

```bash
# Service
NODE_ENV=production|development
PORT=3001
BASE_URL=https://smartlink.mdmcmusicads.com

# Odesli API
ODESLI_API_URL=https://api.song.link/v1-alpha.1/links
ODESLI_USER_AGENT=MDMCMusicAds/1.0

# Analytics
GA4_ID=G-xxxxxxxxxx
META_PIXEL_ID=xxxxxxxxxx

# Branding
BRAND_NAME=MDMC Music Ads
BRAND_COLOR=#E50914
TAGLINE=Marketing musical qui convertit
```

### Headers de cache

```javascript
// Production : cache 1 jour
// Développement : pas de cache
Cache-Control: public, max-age=86400

// Bots sociaux : cache 1 heure
Cache-Control: public, max-age=3600
```

## 🔍 Debug et monitoring

### Logs détaillés

```bash
# En développement
npm run dev

# Logs complets
tail -f logs/smartlinks.log
```

### Health checks

```bash
# Status service
curl http://localhost:3001/health

# Test Odesli
curl http://localhost:3001/api/odesli/test

# Statistiques détaillées
curl http://localhost:3001/api/stats
```

### Tests de métadonnées

```bash
# Facebook Debugger
https://developers.facebook.com/tools/debug/
# URL à tester : https://smartlink.mdmcmusicads.com/artist/track

# Twitter Card Validator
https://cards-dev.twitter.com/validator
```

## 🚨 Dépannage

### Erreurs courantes

#### Service ne démarre pas
```bash
# Vérifier configuration
npm test

# Vérifier port disponible
lsof -i :3001
```

#### "Cannot find module"
```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
```

#### "Odesli timeout"
```bash
# Vérifier connectivité
curl https://api.song.link/v1-alpha.1/links?url=https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC

# Augmenter timeout dans odesliService.js
this.timeout = 15000; // 15 secondes
```

#### "HTML non généré"
```bash
# Vérifier permissions
chmod -R 755 public/smartlinks

# Vérifier template
node -e "console.log(require('ejs').renderFile('./templates/smartlink.ejs', {}))"
```

## 📱 Intégration

### Dans une application web

```javascript
// Générer un SmartLink
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceUrl: userUrl
  })
});

const { data } = await response.json();
console.log('SmartLink créé:', data.url);
```

### Webhook de notification

```javascript
// Après génération réussie
const webhook = process.env.WEBHOOK_URL;
if (webhook) {
  await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify({
      event: 'smartlink_created',
      url: smartlinkUrl,
      artist: artistName,
      track: trackTitle
    })
  });
}
```

## 🔒 Sécurité

### CORS et CSP

```javascript
// Domaines autorisés
ALLOWED_ORIGINS=https://www.mdmcmusicads.com,https://smartlink.mdmcmusicads.com

// Content Security Policy strict
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
})
```

### Rate limiting

```javascript
// Limite Odesli : 1000 req/heure
// Cache local : 24h par URL
// Retry : 3 tentatives max
```

---

**Support** : Documentation complète dans `README.md`  
**Tests** : `npm test` pour validation complète  
**MDMC Music Ads** - Marketing musical qui convertit