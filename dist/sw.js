const CACHE_NAME = 'b-interiors-v1';
const PREFETCH_CACHE = 'b-interiors-prefetch';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/app/App.tsx',
  '/src/styles/theme.css',
  '/src/styles/fonts.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== PREFETCH_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Check if it's a prefetch request
  if (event.request.headers.get('Purpose') === 'prefetch') {
    event.respondWith(
      caches.open(PREFETCH_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET' && !event.request.url.includes('chrome-extension')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});
