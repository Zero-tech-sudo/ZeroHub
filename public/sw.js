const CACHE_NAME = 'zerohub-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
];

// On install, cache vital assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ZeroHub Service Worker] Pre-caching static skeleton and resources');
      return cache.addAll(ASSETS_TO_CACHE).then(() => self.skipWaiting());
    })
  );
});

// Clean up stale caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ZeroHub Service Worker] Purging legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first with cache fallback strategy for general assets,
// Cache-first for heavy fonts and static media to guarantee lightning load speeds.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept or cache POST requests, Firestore operations, or API executions
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api') || url.hostname.includes('firestore.googleapis.com')) {
    return;
  }

  // Handle caching strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in background to refresh cache (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {
            /* Ignore background fetch failures when offline */
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and dynamically cache the asset
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If both fail and this is a navigation request, serve cached shell (/)
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
