# Configuration Claude - Expert SmartLinks MDMC

## CONTEXTE RÉEL PLATEFORME MDMC

### QUI SOMMES-NOUS
- **MDMC Music Ads** : Agence marketing musical française spécialisée artistes/labels
- **Service SmartLinks** : Création de liens intelligents pour partage musical multi-plateformes
- **Position** : Alternative française à Linkfire/Toneden/Features.fm

### CE QU'ON A CONSTRUIT
- **Interface admin** : Création SmartLinks depuis URLs Odesli (song.link/bandcamp.link/etc)
- **Import automatique** : Métadonnées (artwork, titre, artiste) via API Odesli
- **Landing pages** : Routes dynamiques `/smartlinks/:artist/:track`
- **Tracking intégré** : Analytics clics et conversions
- **Architecture** : Express.js backend + React frontend

### PROBLÈME CRITIQUE ACTUEL
**PARTAGE SOCIAL DYSFONCTIONNEL**

Quand clients partagent leurs SmartLinks sur Facebook/Twitter/WhatsApp :
- **Attendu** : Affichage titre track + artwork + nom artiste
- **Réalité** : Meta tags globaux MDMC ("Marketing Musical MDMC" + bannière MDMC)
- **Impact** : Service perçu comme non professionnel, partages non attractifs

### SOLUTION TECHNIQUE IMPLÉMENTÉE
**Middleware Express.js pour meta tags dynamiques :**

```javascript
// Détection bots sociaux (Facebook, Twitter, WhatsApp, etc.)
// Route `/smartlinks/:artist/:track` 
// Injection meta tags spécifiques au track
// fetchSmartLinkData depuis API backend
// Validation stricte, zéro fallback
```

**STATUT** : Pushé sur `mdmcv8-frontend/feature/shortlinks-management`

### PROBLÈME PERSISTANT
**Facebook Debugger continue d'afficher meta tags globaux MDMC malgré middleware**

Les bots sociaux ne semblent pas déclencher le middleware ou celui-ci ne fonctionne pas en production.

## RÈGLES TECHNIQUES STRICTES

### ❌ JAMAIS DE PICTOGRAMMES / EMOJIS
**RÈGLE ABSOLUE : Ne jamais utiliser de pictogrammes, émojis ou symboles.**

### ❌ JAMAIS DE FALLBACKS PLATEFORMES
**RÈGLE CRITIQUE : Ne jamais créer de fallbacks pour logos de plateformes musicales.**
- Si logo manquant : ne rien afficher
- Utiliser uniquement logos officiels
- **Raison** : Les fallbacks compromettent la valeur du service

### ❌ JAMAIS DE DONNÉES INVENTÉES
**RÈGLE ABSOLUE : Ne jamais inventer ou supposer des données.**
- Pas de métadonnées fictives
- Pas de tracks/artistes imaginaires
- Validation stricte des données Odesli uniquement

### ARCHITECTURE VALIDÉE
- **HashRouter** React pour navigation
- **Variables CSS** dans `variables.css`
- **Couleur principale** : #E50914 (rouge MDMC)
- **Responsive** mobile-first

## MISSION PRIORITAIRE
**Résoudre le problème de partage social pour que les SmartLinks affichent correctement les métadonnées des tracks sur Facebook/Twitter/WhatsApp.**

## 🚫 RESTRICTIONS DE MODIFICATION CODE

### ❌ SITE GLOBAL WWW - NON MODIFIABLE
**INTERDICTION ABSOLUE de modifier :**
- Pages publiques (`/src/pages/public/*`)
- Composants layout (`/src/components/layout/*`)
- Sections homepage (`/src/components/sections/*`)
- Pages services (`/src/pages/services/*`)
- Index.html (sauf admin)
- Assets publics (`/public/*` sauf admin)

### ✅ ZONE ADMIN - MODIFIABLE UNIQUEMENT
**AUTORISATION limitée à :**
- Panneau admin (`/src/components/admin/*`)
- Pages admin (`/src/pages/admin/*`)
- Fonctionnalités admin (`/src/features/admin/*`)
- Gestion SmartLinks admin
- Outils d'administration

### ⚠️ EXCEPTIONS CRITIQUES - DOUBLE AUTORISATION OBLIGATOIRE
Modifications globales autorisées UNIQUEMENT avec **DOUBLE CONFIRMATION** :

**PROTOCOLE D'AUTORISATION :**
1. **Première confirmation** : "CONFIRM MODIFICATION SITE WWW"
2. **Seconde confirmation** : "DOUBLE AUTORISATION ACCORDÉE"  
3. **Messages séparés obligatoires** (pas dans le même message)

**CAS AUTORISÉS (avec double confirmation) :**
- Correctifs sécurité critiques
- Bugs bloquants système
- Optimisations performance critiques

**⛔ SANS DOUBLE AUTORISATION = REFUS AUTOMATIQUE**

**RAISON : Site web production stable - Admin panel en développement**

---
*Dernière mise à jour : 1 août 2025*