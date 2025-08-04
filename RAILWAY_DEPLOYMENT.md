# Déploiement Railway - MDMC SmartLinks Service

## Configuration des Variables d'Environnement

### 🚀 Variables Essentielles (À configurer immédiatement)

```bash
# Authentification sécurisée
ADMIN_USERNAME=mdmc_admin
ADMIN_PASSWORD=SecureMDMC@2025!Admin#Production
CLIENT_USERNAME=mdmc_client
CLIENT_PASSWORD=ClientMDMC@2025!Access#Production

# Configuration serveur
NODE_ENV=production
BASE_URL=https://smartlink.mdmcmusicads.com
PORT=3000

# Analytics
GA4_ID=G-P11JTJ21NZ
META_PIXEL_ID=votre_meta_pixel_id

# Sécurité
SESSION_SECRET=générer_clé_secrète_256_bits
CORS_ORIGIN=https://www.mdmcmusicads.com,https://smartlink.mdmcmusicads.com
```

### 📊 Variables UTM Tracking

```bash
UTM_TRACKING_ENABLED=true
UTM_DEFAULT_SOURCE=mdmc_smartlinks
UTM_DEFAULT_MEDIUM=smartlink
UTM_DEFAULT_CAMPAIGN=music_promotion
```

### 🎵 Variables Audio & UI

```bash
AUDIO_PREVIEW_ENABLED=true
MODERN_UI_ENABLED=true
PLATFORM_LOGOS_ENABLED=true
```

### 🔧 Variables Odesli

```bash
ODESLI_API_URL=https://api.song.link/v1-alpha.1/links
ODESLI_USER_AGENT=MDMCMusicAds/1.0
```

### 🎨 Variables MDMC Branding

```bash
BRAND_COLOR=#cc271a
BRAND_NAME=MDMC Music Ads
BRAND_URL=https://www.mdmcmusicads.com
TAGLINE=Marketing musical qui convertit
```

## 🚨 Instructions de Déploiement Railway

### 1. Connexion au projet Railway
```bash
# Connectez-vous à votre projet
railway login
railway link [project-id]
```

### 2. Configuration des variables (une par une)
```bash
# Authentification (CRITIQUE - À changer immédiatement)
railway variables set ADMIN_USERNAME=mdmc_admin
railway variables set ADMIN_PASSWORD="SecureMDMC@2025!Admin#Production"
railway variables set CLIENT_USERNAME=mdmc_client
railway variables set CLIENT_PASSWORD="ClientMDMC@2025!Access#Production"

# Configuration serveur
railway variables set NODE_ENV=production
railway variables set BASE_URL=https://smartlink.mdmcmusicads.com
railway variables set PORT=3000

# Analytics
railway variables set GA4_ID=G-P11JTJ21NZ
railway variables set META_PIXEL_ID=votre_meta_pixel_id

# UTM Tracking
railway variables set UTM_TRACKING_ENABLED=true
railway variables set UTM_DEFAULT_SOURCE=mdmc_smartlinks
railway variables set UTM_DEFAULT_MEDIUM=smartlink

# Features modernes
railway variables set AUDIO_PREVIEW_ENABLED=true
railway variables set MODERN_UI_ENABLED=true
railway variables set PLATFORM_LOGOS_ENABLED=true

# Branding MDMC
railway variables set BRAND_COLOR="#cc271a"
railway variables set BRAND_NAME="MDMC Music Ads"
railway variables set BRAND_URL="https://www.mdmcmusicads.com"

# Sécurité (générer une clé secrète sécurisée)
railway variables set SESSION_SECRET="$(openssl rand -base64 32)"
railway variables set CORS_ORIGIN="https://www.mdmcmusicads.com,https://smartlink.mdmcmusicads.com"
```

### 3. Vérification des variables
```bash
railway variables
```

### 4. Déploiement
```bash
railway up
```

### 5. Test du service
```bash
curl https://smartlink.mdmcmusicads.com/api/health
```

## 🔐 Sécurité Post-Déploiement

### 1. Changement immédiat des identifiants
**CRITIQUE:** Changez immédiatement les mots de passe par défaut :

```bash
railway variables set ADMIN_PASSWORD="VotreMotDePasseSecurise$(date +%s)"
railway variables set CLIENT_PASSWORD="VotreAutreMotDePasse$(date +%s)"
```

### 2. Génération de clés sécurisées
```bash
# Session secret (256 bits)
railway variables set SESSION_SECRET="$(openssl rand -base64 32)"

# Optionnel : JWT secret si vous implémentez JWT
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
```

### 3. Test de connexion
1. Allez sur `https://smartlink.mdmcmusicads.com`
2. Connectez-vous avec vos nouveaux identifiants
3. Testez la génération d'un SmartLink

## 📈 Monitoring & Logs

### Consulter les logs
```bash
railway logs --follow
```

### Variables de debugging
```bash
railway variables set LOG_LEVEL=info
railway variables set ENABLE_REQUEST_LOGS=true
railway variables set DEBUG_MODE=false  # false en production
```

## 🎯 Test Complet du Service

### 1. Test de base
```bash
curl https://smartlink.mdmcmusicads.com/api/health
```

### 2. Test Odesli
```bash
curl -X POST https://smartlink.mdmcmusicads.com/api/odesli/test
```

### 3. Test génération SmartLink
1. Connectez-vous sur l'interface
2. Collez un lien Spotify : `https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh`
3. Vérifiez la génération automatique

## 🚨 Troubleshooting

### Service ne démarre pas
- Vérifiez les variables d'environnement
- Consultez les logs : `railway logs`
- Vérifiez le PORT (doit être 3000 ou $PORT)

### Erreur d'authentification
- Vérifiez ADMIN_USERNAME et ADMIN_PASSWORD
- Pas d'espaces dans les variables
- Guillemets pour les mots de passe complexes

### Erreur Odesli
- Vérifiez ODESLI_API_URL
- Testez manuellement l'API Odesli

## ✅ Checklist Finale

- [ ] Variables d'authentification configurées et testées
- [ ] BASE_URL correctement configuré
- [ ] GA4_ID configuré
- [ ] Service accessible sur smartlink.mdmcmusicads.com
- [ ] Interface de connexion fonctionnelle
- [ ] Génération de SmartLink testée
- [ ] Logs de monitoring activés
- [ ] Variables de sécurité générées

---

**🎵 Service MDMC SmartLinks - Version Production**
*Généré automatiquement avec tracking UTM, interface moderne et audio preview*