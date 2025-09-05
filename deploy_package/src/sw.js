// Lightweight, scope-safe Service Worker for Mumbai Transport (installed via ./src/sw.js)
const CACHE_VERSION = 'mt-v1';
const CACHE_NAME = `mt-cache-${CACHE_VERSION}`;

// App shell (relative to root directory since sw.js is imported from root). Keep small; HTML is runtime-updated.
const PRECACHE_ASSETS = [
  './',  // Root directory
  './index.html',
  './offline.html',
  './src/manifest.json',
  './src/styles/style.css',
  './src/js/app.js',
  './src/js/language-manager.js',
  './src/assets/icons/icon-192x192.png',
  './src/assets/icons/icon-512x512.png',
  './real_mumbai_transport_data.js'
];

// Install: pre-cache minimal shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('mt-cache-') && k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Helper: classify request
function isHTML(req) {
  return req.destination === 'document' || (req.headers.get('accept') || '').includes('text/html');
}
function isStatic(req) {
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname.toLowerCase();
  return /\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|json|txt|xml|woff2?|map)$/.test(path);
}

// Strategy: network-first for HTML, cache-first for static assets, passthrough for others
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return; // Let non-GET requests pass through
  }

 // Network-first for HTML documents to keep content fresh
 if (isHTML(request)) {
   event.respondWith(
     fetch(request)
       .then((resp) => {
         const copy = resp.clone();
         caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
         return resp;
       })
       .catch(async () => {
         const cached = await caches.match(request);
         if (cached) return cached;
         // Fallback to offline shell
         return caches.match('./offline.html');
       })
   );
   return;
 }

  // Cache-first for static same-origin assets
  if (isStatic(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((resp) => {
            // Only cache successful, same-origin responses
            if (resp.ok && new URL(request.url).origin === self.location.origin) {
              const copy = resp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return resp;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Default: network
  // Avoid caching third-party APIs like Google Maps to keep API keys safe and fresh
});
