// Offline cache so the card works in the field without signal.
const CACHE = 'field-card-v7';
const FILES = [
  './', 'index.html', 'styles.css?v=7', 'app.js?v=7',
  'assets/golden.jpg', 'assets/overcast.jpg', 'assets/hazy.jpg', 'assets/midday.jpg',
  'assets/athmuqam-waterfall-long-exposure.jpg'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
// Network first, so updates show on the next load; the cache is the offline fallback.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.headers.has('range')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))
  );
});
