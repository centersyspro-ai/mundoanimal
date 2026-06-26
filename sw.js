const CACHE_NAME = 'mundo-animal-cache-v1';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap'
];

// Instalar y guardar en caché la estructura básica
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Cache First, caída a Red
self.addEventListener('fetch', (e) => {
  // Ignorar peticiones externas como el iframe de Google Maps o Calendar para evitar problemas
  if (!e.request.url.startsWith(self.location.origin) && !e.request.url.includes('fonts.googleapis')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // Si todo falla (offline absoluto), podrías retornar un offline.html aquí
    })
  );
});
