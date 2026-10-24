const CACHE_NAME = 'b-interiors-v2';
const PREFETCH_CACHE = 'b-interiors-prefetch-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.headers.get('Purpose') === 'prefetch') {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(PREFETCH_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
    );
  }
});
