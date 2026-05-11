self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // נדרש עבור PWA אבל כרגע לא מבצע מטמון (Caching)
});
