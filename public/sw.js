// Service worker for PWA with auth-aware caching
const CACHE_NAME = 'pocketcv-v3';
const urlsToCache = [
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // NUNCA fazer cache de autenticação ou API calls
  const isAuthRequest = url.pathname.includes('/auth/') || 
                        url.pathname.includes('/rest/') ||
                        url.hostname.includes('supabase.co');
  
  if (isAuthRequest) {
    // Sempre ir para a rede para auth
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para outros recursos, network first (sempre tentar rede primeiro)
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Não fazer cache de redirecionamentos
        if (response.status === 302 || response.status === 301) {
          return response;
        }
        return response;
      })
      .catch(function() {
        // Se falhar, tentar cache (útil para offline)
        return caches.match(event.request);
      })
  );
});