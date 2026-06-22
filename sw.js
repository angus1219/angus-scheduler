const CACHE = 'angus-scheduler-v5';
const STATIC = [
  '/angus-scheduler/manifest.json',
  '/angus-scheduler/icon.svg',
  '/angus-scheduler/favicon.ico'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // For HTML: always go to network first, fall back to cache
  if (e.request.mode === 'navigate' || e.request.headers.get('Accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put('/angus-scheduler/fallback', clone));
          return res;
        })
        .catch(() => caches.match('/angus-scheduler/fallback'))
    );
    return;
  }
  // For assets: cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
