# PROMPT COMPLET : Service SmartLinks MDMC Music Ads

## 🎯 CONTEXTE DE LA MARQUE

**MDMC Music Ads** est une agence de marketing musical spécialisée dans la promotion d'artistes et de labels de musique. L'agence propose des services de campagnes publicitaires (YouTube Ads, Meta Ads, TikTok) et d'outils de promotion musicale.

### Identité de marque MDMC Music Ads :
- **Couleur principale** : Rouge MDMC `#E50914`
- **Couleurs secondaires** : Noir `#141414`, Blanc `#FFFFFF`, Gris clair `#F8F9FA`
- **Typographies** : Poppins (titres), Inter (texte)
- **Tagline** : "Marketing musical qui convertit"
- **Ton** : Professionnel, moderne, orienté résultats
- **Domaine** : www.mdmcmusicads.com
- **Sous-domaine souhaité** : smartlink.mdmcmusicads.com

### Règles de marque STRICTES :
- ❌ **JAMAIS d'emojis ou pictogrammes** dans l'interface utilisateur
- ❌ **JAMAIS de fallbacks** pour les logos de plateformes musicales
- ✅ **Texte simple et professionnel** uniquement
- ✅ **Cohérence avec l'identité visuelle** MDMC

## 🎵 OBJECTIF DU PROJET

Créer un **service SmartLinks dédié** qui génère des pages HTML statiques pour partager la musique d'artistes sur toutes les plateformes de streaming. Le service doit être **100% HTML natif** (pas de SPA) pour un SEO optimal et des métadonnées Open Graph parfaites pour le partage social.

### Problème à résoudre :
Les SmartLinks actuels utilisent une SPA React avec routing hash (`#/smartlinks/artist/track`) qui empêche les bots sociaux (Facebook, Twitter, WhatsApp) de lire les métadonnées Open Graph dynamiques, résultant en des aperçus génériques lors du partage.

### Solution souhaitée :
Service HTML statique indépendant avec URLs propres (`smartlink.mdmcmusicads.com/artist/track`) et métadonnées Open Graph natives dans chaque fichier HTML.

## 👥 USER STORIES

### En tant qu'artiste/label :
- Je veux partager ma musique avec un lien unique qui redirige vers toutes les plateformes
- Je veux que mon SmartLink affiche la bonne pochette et description sur les réseaux sociaux
- Je veux des URLs courtes et mémorables sans hash
- Je veux un design professionnel cohérent avec MDMC

### En tant qu'utilisateur final :
- Je veux accéder rapidement à ma plateforme de streaming préférée
- Je veux une expérience fluide sur mobile et desktop
- Je veux voir les informations du track (titre, artiste, pochette)
- Je veux une interface rapide sans temps de chargement

### En tant que bot social (Facebook, Twitter, etc.) :
- Je veux lire des métadonnées Open Graph natives dans le HTML
- Je veux récupérer la pochette, titre et description directement
- Je veux des URLs sans JavaScript pour indexation SEO

## 🔗 INTÉGRATION ODESLI (SONGLINK) OBLIGATOIRE

**Odesli** (anciennement SongLink) est l'API de référence pour récupérer automatiquement les liens de toutes les plateformes musicales à partir d'un seul lien source.

### Fonctionnement Odesli :
1. **Input** : URL d'une plateforme (ex: Spotify, Apple Music, YouTube)
2. **Output** : Liens vers toutes les plateformes + métadonnées enrichies
3. **Avantages** : Automatisation complète, données fiables, couverture mondiale

### API Odesli - Endpoints clés :
```
GET https://api.song.link/v1-alpha.1/links?url={MUSIC_URL}
```

### Exemple de réponse Odesli :
```json
{
  "entityUniqueId": "SPOTIFY::track::4uLU6hMCjMI75M1A2tKUQC",
  "userCountry": "FR",
  "pageUrl": "https://song.link/s/4uLU6hMCjMI75M1A2tKUQC",
  "linksByPlatform": {
    "spotify": {"url": "https://open.spotify.com/track/..."},
    "appleMusic": {"url": "https://music.apple.com/..."},
    "youtube": {"url": "https://music.youtube.com/..."},
    "deezer": {"url": "https://deezer.com/..."}
  },
  "entitiesByUniqueId": {
    "SPOTIFY::track::...": {
      "title": "Wait and Bleed",
      "artistName": "Slipknot",
      "thumbnailUrl": "https://i.scdn.co/image/...",
      "audioPreviewUrl": "https://p.scdn.co/mp3-preview/..."
    }
  }
}
```

### Utilisation dans le service :
1. **Création SmartLink** : Admin saisit 1 URL → Odesli récupère tous les liens
2. **Enrichissement auto** : Pochette, titre, artiste extraits d'Odesli
3. **Mise à jour facile** : Re-appel Odesli pour actualiser les liens
4. **Fallback intelligent** : Si Odesli échoue, utiliser données manuelles

### Gestion des erreurs Odesli :
- **Rate limiting** : Respecter les limites API (1000 req/h)
- **Timeout** : 10s max par requête
- **Retry logic** : 3 tentatives avec backoff exponentiel
- **Cache local** : Stocker réponses pour éviter appels répétés

## 🏗️ ARCHITECTURE TECHNIQUE REQUISE

### Stack technique OBLIGATOIRE :
- **Backend** : Node.js + Express (minimaliste)
- **Template Engine** : EJS (pour HTML statique)
- **Base de données** : MongoDB (connexion à la DB existante)
- **API externe** : Odesli (SongLink) pour récupération automatique des liens plateformes
- **Pas de framework frontend** : HTML/CSS/JS vanilla uniquement
- **Déploiement** : Railway (compatible avec l'infrastructure existante)

### Structure de dossiers requise :
```
smartlink/
├── src/
│   └── app.js              # Application Express
├── routes/
│   ├── smartlinks.js       # Routes principales /:artist/:track
│   └── api.js              # API CRUD pour gestion
├── services/
│   ├── htmlGenerator.js    # Générateur HTML statique
│   └── odesliService.js    # Service Odesli pour récupération liens
├── templates/
│   └── smartlink.ejs       # Template EJS pour HTML
├── public/
│   └── smartlinks/         # Fichiers HTML générés
│       ├── artist1/
│       │   └── track1.html
│       └── artist2/
│           └── track2.html
├── package.json
└── .env
```

## 📋 ÉTAPES DE DÉVELOPPEMENT

### Phase 1 : Configuration de base
1. **Initialiser projet Node.js** avec dependencies (express, ejs, mongoose, cors, helmet)
2. **Configurer Express** avec sécurité et CORS pour sous-domaine
3. **Créer template EJS** avec charte graphique MDMC complète
4. **Tester génération HTML** avec données factices

### Phase 2 : Intégration Odesli et génération HTML
1. **Service Odesli** : Récupération automatique des liens plateformes via API
2. **Enrichissement données** : Métadonnées (pochette, durée, genre) depuis Odesli
3. **Service de génération** : Créer/Modifier/Supprimer fichiers HTML
4. **Organisation des fichiers** : Arborescence par artiste/track
5. **Métadonnées optimales** : Open Graph, Twitter Cards, Schema.org
6. **Template responsive** : Mobile-first avec animations fluides

### Phase 3 : Routes et API
1. **Route principale** : `GET /:artistSlug/:trackSlug` → Servir HTML statique
2. **API CRUD** : `POST /api/generate`, `PUT /api/update`, `DELETE /api/delete`
3. **Analytics** : Logging des accès (bots vs utilisateurs)
4. **Gestion erreurs** : 404 personnalisées avec design MDMC

### Phase 4 : Intégration et tests
1. **Connexion MongoDB** : Récupérer données SmartLinks existants
2. **Migration données** : Générer HTML pour SmartLinks actuels
3. **Tests complets** : Facebook Debugger, Twitter Card Validator
4. **Performance** : Cache, compression, headers optimaux

## 🚫 RESTRICTIONS ET CONTRAINTES

### Restrictions techniques ABSOLUES :
- ❌ **Aucun framework JavaScript** (React, Vue, Angular)
- ❌ **Aucun routing côté client** (pas de hash dans URLs)
- ❌ **Aucun Single Page Application** (SPA)
- ❌ **Aucun build process complexe** (webpack, vite, etc.)
- ❌ **Aucune dependency frontend** lourde

### Contraintes de design :
- ✅ **Respecter charte MDMC** : Couleurs, fonts, spacing exact
- ✅ **Design mobile-first** : Responsive parfait
- ✅ **Performance optimale** : < 2s de chargement
- ✅ **Accessibilité** : ARIA labels, contraste, navigation clavier

### Contraintes techniques :
- ✅ **HTML5 sémantique** : Structure claire pour SEO
- ✅ **CSS vanilla** : Variables CSS, pas de preprocessor
- ✅ **JavaScript minimal** : Analytics et interactions uniquement
- ✅ **Métadonnées complètes** : Open Graph + Twitter + Schema.org

### Contraintes opérationnelles :
- ✅ **Compatibilité Railway** : Configuration de déploiement simple
- ✅ **Logs détaillés** : Suivi des accès et erreurs
- ✅ **Monitoring** : Health checks et métriques
- ✅ **Documentation** : README complet avec exemples

## 🎨 SPÉCIFICATIONS DESIGN

### Charte graphique MDMC (STRICT) :
```css
:root {
  /* Couleurs MDMC */
  --primary-color: #E50914;      /* Rouge MDMC */
  --secondary-color: #141414;    /* Noir profond */
  --white: #FFFFFF;
  --gray-light: #F8F9FA;
  --gray: #6C757D;
  --gray-dark: #495057;
  
  /* Fonts MDMC */
  --font-primary: 'Poppins', sans-serif;    /* Titres */
  --font-secondary: 'Inter', sans-serif;     /* Texte */
  
  /* Spacing système */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-base: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Transitions */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Layout type SmartLink :
- **Header** : Pochette (160px) + Titre + Artiste + Description
- **Content** : Liste des plateformes avec hover effects
- **Footer** : "Powered by MDMC Music Ads" + tagline
- **Couleurs plateformes** : Spotify (#1DB954), Apple (#FA243C), YouTube (#FF0000), etc.

### Responsive breakpoints :
- **Mobile** : < 480px (design principal)
- **Tablet** : 481px - 768px
- **Desktop** : > 769px

## 📊 MÉTRIQUES DE SUCCÈS

### Performance :
- **Vitesse** : < 1s First Contentful Paint
- **SEO** : Score 100/100 Lighthouse
- **Accessibilité** : Score 100/100 WAVE

### Fonctionnel :
- **Open Graph** : 100% des métadonnées correctes sur Facebook Debugger
- **Twitter Cards** : Aperçus parfaits sur Twitter Card Validator
- **Mobile UX** : Navigation fluide sur tous devices

### Technique :
- **Uptime** : 99.9% disponibilité
- **Logs** : Traçabilité complète des accès
- **Cache** : Headers optimaux pour performance

## 🔧 CONFIGURATION ENVIRONNEMENT

### Variables .env requises :
```bash
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb://yamanote.proxy.rlwy.net:23888/mdmc
BASE_URL=https://smartlink.mdmcmusicads.com
ALLOWED_ORIGINS=https://www.mdmcmusicads.com,https://smartlink.mdmcmusicads.com
GA4_ID=G-P11JTJ21NZ

# API Odesli (SongLink)
ODESLI_API_URL=https://api.song.link/v1-alpha.1/links
ODESLI_USER_AGENT=MDMCMusicAds/1.0

# MDMC Branding
BRAND_COLOR=#E50914
BRAND_NAME=MDMC Music Ads
TAGLINE=Marketing musical qui convertit
```

### Commandes npm requises :
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "generate": "node scripts/generate-all.js",
    "test": "node scripts/test-service.js"
  }
}
```

## 💡 EXEMPLES D'USAGE

### URL finale souhaitée :
```
https://smartlink.mdmcmusicads.com/slipknot/wait-and-bleed
https://smartlink.mdmcmusicads.com/metallica/master-of-puppets
https://smartlink.mdmcmusicads.com/daft-punk/one-more-time
```

### API endpoints :
```
POST /api/generate     # Créer nouveau SmartLink
PUT /api/update/:artist/:track   # Modifier SmartLink
DELETE /api/delete/:artist/:track # Supprimer SmartLink
GET /api/stats         # Statistiques service
```

### Métadonnées générées :
```html
<meta property="og:type" content="music.song">
<meta property="og:title" content="Wait and Bleed - Slipknot">
<meta property="og:description" content="Écoutez 'Wait and Bleed' de Slipknot...">
<meta property="og:image" content="https://i.scdn.co/image/...">
<meta property="og:url" content="https://smartlink.mdmcmusicads.com/slipknot/wait-and-bleed">
```

---

## 🎯 MISSION FINALE

**Créer un service SmartLinks HTML statique professionnel, respectant parfaitement la charte MDMC Music Ads, optimisé pour le SEO et le partage social, sans aucune technologie SPA, prêt pour déploiement sur sous-domaine dédié.**

Le service doit être **simple, rapide, efficace** et résoudre définitivement les problèmes de métadonnées Open Graph pour les partages sociaux des SmartLinks MDMC.