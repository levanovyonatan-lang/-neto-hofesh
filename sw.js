const CACHE_VERSION = 'v321';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll([
        './',
        'index.html',
        'assets/css/styles.css',
        'assets/js/app.js',
        'tips.js',
        'assets/js/games/dino-school.js',
        'manifest.json'
      ]).catch(() => {});
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()).then(() => {
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION }));
      });
    })
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = req.url || '';

  // Stale-While-Revalidate for HTML/document navigation and core scripts/styles for instant PWA startup
  if (req.mode === 'navigate' || url.includes('index.html') || url.endsWith('/') || url.includes('.css') || url.includes('.js') || url.includes('manifest.json')) {
    e.respondWith(
      caches.match(req).then(cachedResponse => {
        const fetchPromise = fetch(req).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(req, responseClone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Cache-First for static assets (images, icons)
  e.respondWith(
    caches.match(req).then(cachedResponse => {
      if (cachedResponse) {
        fetch(req).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_VERSION).then(cache => cache.put(req, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(req);
    })
  );
});




