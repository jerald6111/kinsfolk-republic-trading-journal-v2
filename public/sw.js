/* Kinsfolk Republic — minimal runtime caching service worker (no build deps). */
const CACHE_NAME = 'kr-cache-v1';

self.addEventListener('install', (event) => {
  // Activate this SW immediately, skipping the waiting phase.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up any caches from previous versions.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore cross-origin requests (APIs, CDNs, fonts) — let them pass through.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first, fall back to cache, then to '/'.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cached = await cache.match(request);
          if (cached) return cached;
          const fallback = await cache.match('/');
          if (fallback) return fallback;
          return Response.error();
        }
      })()
    );
    return;
  }

  // Other same-origin GETs: stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => undefined);

      // Serve cache immediately if present; otherwise wait for network.
      return cached || (await networkFetch) || Response.error();
    })()
  );
});
