# MDMC SmartLinks Service

Service HTML statique dédié pour SmartLinks avec SEO optimal et intégration Odesli automatique.

## 🎯 Objectif

Créer des pages HTML statiques pour partager la musique d'artistes sur toutes les plateformes de streaming avec métadonnées Open Graph parfaites pour le partage social.

## ✨ Fonctionnalités

- **HTML statique pur** : Pas de SPA, SEO optimal
- **Intégration Odesli automatique** : Récupération des liens plateformes
- **Métadonnées Open Graph natives** : Aperçus parfaits sur réseaux sociaux
- **URLs propres** : `smartlink.mdmcmusicads.com/artist/track`
- **Charte MDMC respectée** : Design cohérent, pas d'emojis
- **Performance optimisée** : Compression, cache, headers optimaux

## 🚀 Démarrage rapide

### Installation

```bash
# Cloner et installer les dépendances
npm install

# Copier la configuration
cp .env.example .env

# Ajuster les variables dans .env
```

### Configuration (.env)

```bash
NODE_ENV=production
PORT=3001
BASE_URL=https://smartlink.mdmcmusicads.com
MONGO_URI=mongodb://yamanote.proxy.rlwy.net:23888/mdmc
GA4_ID=G-P11JTJ21NZ
ODESLI_API_URL=https://api.song.link/v1-alpha.1/links
```

### Démarrage

```bash
# Production
npm start

# Développement
npm run dev

# Tests complets
npm test

# Génération d'exemples
npm run generate
```

## 📋 API Endpoints

### Génération SmartLinks

```bash
# Génération via Odesli (recommandé)
POST /api/generate
{
  "sourceUrl": "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
  "customData": {
    "description": "Description personnalisée"
  }
}

# Génération manuelle (fallback)
POST /api/generate
{
  "trackTitle": "Wait and Bleed",
  "artist": { "name": "Slipknot", "slug": "slipknot" },
  "slug": "wait-and-bleed",
  "platformLinks": [...]
}
```

### Gestion

```bash
# Statistiques service
GET /api/stats

# Health check
GET /api/health

# Test Odesli
GET /api/odesli/test

# Mise à jour SmartLink
PUT /api/update/:artistSlug/:trackSlug

# Suppression SmartLink
DELETE /api/delete/:artistSlug/:trackSlug
```

## 🎵 Utilisation

### 1. Génération depuis URL

```javascript
// Via API
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceUrl: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'
  })
});

// Via script CLI
npm run generate "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"
```

### 2. Accès aux SmartLinks

```
https://smartlink.mdmcmusicads.com/slipknot/wait-and-bleed
https://smartlink.mdmcmusicads.com/metallica/master-of-puppets
```

### 3. URLs générées

```
public/smartlinks/
├── slipknot/
│   └── wait-and-bleed.html
├── metallica/
│   └── master-of-puppets.html
└── daft-punk/
    └── one-more-time.html
```

## 🔧 Architecture

```
smartlink/
├── src/
│   └── app.js              # Application Express
├── routes/
│   ├── smartlinks.js       # Routes principales /:artist/:track
│   └── api.js              # API CRUD
├── services/
│   ├── odesliService.js    # Intégration Odesli
│   └── staticHtmlGenerator.js
├── templates/
│   └── smartlink.ejs       # Template HTML
├── public/
│   └── smartlinks/         # Fichiers HTML générés
├── scripts/
│   ├── test-service.js     # Tests complets
│   └── generate-smartlinks.js
└── railway.toml            # Config déploiement
```

## 🎨 Charte graphique MDMC

### Couleurs

```css
:root {
  --primary-color: #E50914;    /* Rouge MDMC */
  --secondary-color: #141414;  /* Noir profond */
  --white: #FFFFFF;
  --gray-light: #F8F9FA;
}
```

### Fonts

- **Titres** : Poppins (400, 500, 600, 700)
- **Texte** : Inter (300, 400, 500)

### Règles strictes

- ❌ **JAMAIS d'emojis** dans l'interface
- ❌ **JAMAIS de fallbacks** pour logos plateformes
- ✅ **Texte simple et professionnel** uniquement

## 🔍 Tests et validation

### Tests automatiques

```bash
# Test complet du service
npm test

# Résultat attendu
✅ Tests réussis: 6
❌ Tests échoués: 0
📊 Score: 100%
```

### Tests manuels

```bash
# Health check
curl https://smartlink.mdmcmusicads.com/health

# Test Odesli
curl https://smartlink.mdmcmusicads.com/api/odesli/test

# Génération test
curl -X POST https://smartlink.mdmcmusicads.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"sourceUrl":"https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"}'
```

### Validation SEO

- **Facebook Debugger** : https://developers.facebook.com/tools/debug/
- **Twitter Card Validator** : https://cards-dev.twitter.com/validator
- **Lighthouse** : Score 100/100 Performance, SEO, Accessibilité

## 🚀 Déploiement Railway

### Configuration automatique

```toml
# railway.toml déjà configuré
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"

[healthcheck]
path = "/health"
```

### Variables d'environnement Railway

```bash
# Variables à configurer dans Railway
NODE_ENV=production
BASE_URL=https://smartlink.mdmcmusicads.com
MONGO_URI=mongodb://yamanote.proxy.rlwy.net:23888/mdmc
GA4_ID=G-P11JTJ21NZ
```

### Déploiement

```bash
# Push vers Railway
git add .
git commit -m "Deploy SmartLinks service"
git push origin main

# Railway déploie automatiquement
```

## 📊 Monitoring

### Métriques clés

- **Uptime** : 99.9% disponibilité
- **Performance** : < 1s First Contentful Paint
- **SEO** : Score 100/100 Lighthouse
- **Cache hit ratio** : > 80%

### Logs

```bash
# Logs production
railway logs

# Logs locaux
tail -f logs/smartlinks.log
```

## 🔒 Sécurité

- **Helmet.js** : Headers de sécurité
- **CORS** : Domaines autorisés uniquement
- **CSP** : Content Security Policy strict
- **Rate limiting** : Protection API Odesli
- **Input validation** : Validation URLs sources

## 🐛 Dépannage

### Erreurs courantes

```bash
# Service ne démarre pas
npm run test  # Vérifier configuration

# Odesli timeout
# Vérifier connectivité réseau et limites API

# HTML non généré
# Vérifier permissions dossier public/smartlinks

# Métadonnées incorrectes
# Vérifier template EJS et données Odesli
```

### Support

- **Documentation** : README.md
- **Tests** : `npm test`
- **Logs** : Morgan + console.log
- **Monitoring** : `/health` et `/api/stats`

---

**MDMC Music Ads** - Marketing musical qui convertit