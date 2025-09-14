# Configuration Newsletter Brevo - RÉSOLU ✅

## Problème résolu
L'inscription newsletter ne fonctionnait pas car :
1. Le `FloatingNewsletterButton` utilisait une mauvaise URL API
2. L'ID de liste Brevo était incorrect (2 au lieu de 7)
3. La clé API Brevo n'était pas configurée

## Corrections apportées
- ✅ `FloatingNewsletterButton.jsx` utilise maintenant `newsletterService.subscribe()`
- ✅ ID de liste corrigé: `listIds: [7]` dans `newsletter.service.js`
- ✅ Fallback automatique vers API Brevo quand backend indisponible

## Configuration requise

### Variables d'environnement
Ajoutez dans `.env.local` et `.env.production` :

```env
VITE_BREVO_API_KEY="votre_clé_api_brevo_ici"
```

### Clé API Brevo
La clé API Brevo est configurée localement dans les fichiers .env (non versionnés pour sécurité).

## Fonctionnement
1. Le service essaie d'abord le backend Railway
2. Si backend indisponible → fallback automatique vers API Brevo
3. Les contacts sont ajoutés à la liste Brevo #7
4. Gestion automatique des doublons

## Test
✅ Newsletter fonctionnelle - inscriptions arrivent dans Brevo liste #7

## Fichiers modifiés
- `src/components/common/FloatingNewsletterButton.jsx`
- `src/services/newsletter.service.js`
- `.env.local` (ajout VITE_BREVO_API_KEY)
- `.env.production` (ajout VITE_BREVO_API_KEY)