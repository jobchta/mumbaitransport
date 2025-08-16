// top-level cache config
const CACHE_NAME = 'mumbai-transport-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './mumbai_transport_pwa.html'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('Opened cache');
        await Promise.all(
          urlsToCache.map(async (url) => {
            try {
              await cache.add(new Request(url, { mode: 'no-cors' }));
            } catch (e) {
              console.warn('Skipping cache for', url, e);
            }
          })
        );
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Background sync for offline route planning
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Use relative path for API sync so it works under /portal/ (no-op on static hosting)
  return fetch('./api/sync-routes')
    .then(response => {
      if (!response.ok) return Promise.resolve();
      return response.json().then(data => {
        console.log('Background sync completed:', data);
      });
    })
    .catch(error => {
      console.log('Background sync skipped/failed:', error);
    });
}

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New route update available!',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Route',
        icon: 'icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Mumbai Transport', options)
  );
});

// Notification click handling (use relative path)
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./mumbai_transport_pwa.html')
    );
  }
});
