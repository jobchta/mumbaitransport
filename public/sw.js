// MumbaiLocal Service Worker - v1.0.0
const CACHE_NAME = "mumbailocal-v1";
const STATIC_CACHE = "mumbailocal-static-v1";
const DYNAMIC_CACHE = "mumbailocal-dynamic-v1";

// Core assets to cache on install
const CORE_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.svg",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching core assets");
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log("[SW] Core assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache core assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE
            )
            .map((cacheName) => {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (except for specific allowed origins)
  if (url.origin !== location.origin) {
    // Allow Twitter widgets and other external resources
    if (url.hostname.includes("twitter.com") || 
        url.hostname.includes("twimg.com") ||
        url.hostname.includes("platform.twitter.com")) {
      event.respondWith(
        caches.open(DYNAMIC_CACHE).then((cache) => {
          return cache.match(request).then((response) => {
            return (
              response ||
              fetch(request).then((networkResponse) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              })
            );
          });
        })
      );
    }
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/").then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request).catch(() => {
            // Return offline page if available, otherwise return cached root
            return caches.match("/");
          })
        );
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version and update cache in background
          fetch(request)
            .then((networkResponse) => {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, networkResponse);
              });
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache, fetch from network and cache
        return fetch(request).then((networkResponse) => {
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response("Offline", { status: 503 });
        });
      })
  );
});

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "New update available",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || "MumbaiLocal", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});

// Background sync for offline actions (for future use)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-stations") {
    event.waitUntil(
      // Sync offline station searches when back online
      console.log("[SW] Background sync triggered for stations")
    );
  }
});

console.log("[SW] Service worker loaded");
