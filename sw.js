const CACHE_VERSION = 'v187';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Force network-first for navigation requests to bypass aggressive iOS Safari PWA caching
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request.url + (e.request.url.includes('?') ? '&' : '?') + 'cb=' + Date.now(), { cache: 'no-store' })
        .catch(() => fetch(e.request))
    );
  }
});
