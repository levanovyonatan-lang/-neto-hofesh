const CACHE_VERSION = 'v256';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    self.clients.claim().then(() => {
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'UPDATE_ICONS' }));
      });
    })
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url || '';
  // Only bypass cache for manifest and icon/image assets to force standalone PWA icon updates without touching page navigation
  if (url.includes('manifest.json') || url.includes('official-sun-neto') || url.includes('icon-neto-sunglasses') || url.includes('.png') || url.includes('.ico') || url.includes('.jpg') || url.includes('.jpeg')) {
    e.respondWith(
      fetch(e.request.url + (e.request.url.includes('?') ? '&' : '?') + 'cb=' + Date.now(), { cache: 'no-store' })
        .catch(() => fetch(e.request))
    );
  }
});
