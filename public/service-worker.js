/**
 * MDMC SmartLinks - Service Worker
 * Support offline basique pour le Dashboard SmartLinks
 * Cache les ressources statiques et quelques pages critiques
 */

const CACHE_NAME = 'mdmc-smartlinks-v1.0.0';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 heures

// Ressources critiques à mettre en cache
const CRITICAL_RESOURCES = [
  '/js/auth.js',
  '/images/MDMC_logo_blanc fond transparent.png',
  '/login',
  '/dashboard',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Ressources optionnelles (images, etc.)
const OPTIONAL_RESOURCES = [
  '/favicon.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache ouvert:', CACHE_NAME);
        
        // Cache des ressources critiques
        return cache.addAll(CRITICAL_RESOURCES)
          .then(() => {
            console.log('[SW] Ressources critiques mises en cache');
            
            // Cache des ressources optionnelles (ne pas faire échouer l'installation)
            return Promise.allSettled(
              OPTIONAL_RESOURCES.map(url => 
                cache.add(url).catch(err => 
                  console.warn('[SW] Échec cache optionnel:', url, err)
                )
              )
            );
          });
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting(); // Activer immédiatement
      })
      .catch(error => {
        console.error('[SW] Erreur installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    // Nettoyer les anciens caches
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== CACHE_NAME && cacheName.startsWith('mdmc-smartlinks-');
            })
            .map(cacheName => {
              console.log('[SW] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim(); // Contrôler immédiatement les clients existants
      })
      .catch(error => {
        console.error('[SW] Erreur activation:', error);
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET et les WebSockets
  if (request.method !== 'GET' || url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }
  
  // Ignorer les requêtes API (toujours en ligne)
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Ignorer les requêtes externes non critiques
  if (url.origin !== location.origin && !isCriticalExternalResource(url)) {
    return;
  }
  
  event.respondWith(
    // Stratégie Network First pour les pages HTML
    url.pathname === '/' || url.pathname.includes('.html') || url.pathname === '/dashboard' || url.pathname === '/login'
      ? networkFirst(request)
      : cacheFirst(request)
  );
});

// Stratégie Cache First (pour ressources statiques)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Vérifier l'expiration du cache
      const cacheTime = await getCacheTime(request.url);
      if (cacheTime && (Date.now() - cacheTime) < CACHE_EXPIRATION) {
        return cachedResponse;
      }
    }
    
    // Récupérer depuis le réseau
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre à jour le cache
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      await setCacheTime(request.url);
      
      console.log('[SW] Cache mis à jour:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Erreur Cache First:', request.url, error);
    
    // Fallback vers le cache si disponible
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Réponse d'erreur offline
    return createOfflineResponse(request);
  }
}

// Stratégie Network First (pour pages dynamiques)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache la réponse
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      await setCacheTime(request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Erreur Network First:', request.url, error);
    
    // Fallback vers le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Page offline personnalisée pour les pages HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      return createOfflinePage();
    }
    
    return createOfflineResponse(request);
  }
}

// Vérifier si une ressource externe est critique
function isCriticalExternalResource(url) {
  return url.hostname === 'fonts.googleapis.com' || 
         url.hostname === 'fonts.gstatic.com';
}

// Gestion du temps de cache
async function setCacheTime(url) {
  try {
    const cache = await caches.open(CACHE_NAME + '-meta');
    const response = new Response(Date.now().toString());
    await cache.put(url + '-timestamp', response);
  } catch (error) {
    console.warn('[SW] Erreur setCacheTime:', error);
  }
}

async function getCacheTime(url) {
  try {
    const cache = await caches.open(CACHE_NAME + '-meta');
    const response = await cache.match(url + '-timestamp');
    if (response) {
      const timestamp = await response.text();
      return parseInt(timestamp, 10);
    }
  } catch (error) {
    console.warn('[SW] Erreur getCacheTime:', error);
  }
  return null;
}

// Créer une réponse offline basique
function createOfflineResponse(request) {
  if (request.headers.get('accept')?.includes('image/')) {
    // Image placeholder pour les images manquantes
    return new Response(
      '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="4" fill="#161616"/><path d="M24 16L24 32" stroke="#666666" stroke-width="1.5" stroke-linecap="round"/><path d="M16 24L32 24" stroke="#666666" stroke-width="1.5" stroke-linecap="round"/></svg>',
      { 
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 200 
      }
    );
  }
  
  return new Response('Contenu non disponible hors ligne', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Créer une page offline personnalisée
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mode hors ligne | MDMC Dashboard</title>
      <style>
        :root {
          --primary: #E50914;
          --background: #0a0a0a;
          --surface: #111111;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--background);
          color: var(--text-primary);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .offline-container {
          text-align: center;
          max-width: 400px;
        }
        .offline-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        p {
          color: var(--text-secondary);
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .retry-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .retry-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1>Mode hors ligne</h1>
        <p>Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Réessayer la connexion
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    status: 200
  });
}

// Messages du Service Worker
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_CACHE_STATUS':
      event.ports[0].postMessage({
        cacheSize: 0, // À implémenter si nécessaire
        lastUpdate: Date.now()
      });
      break;
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
  }
});

console.log('[SW] Service Worker MDMC SmartLinks chargé');