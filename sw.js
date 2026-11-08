// Offline cache so the card works in the field without signal.
const CACHE = 'field-card-v1';
const FILES = [
  './', 'index.html', 'styles.css', 'app.js',
  'assets/golden.jpg', 'assets/overcast.jpg', 'assets/hazy.jpg', 'assets/midday.jpg', 'assets/grass.jpg',
  'assets/athmuqam-waterfall-long-exposure.jpg', 'assets/tresaith-waterfall-poster.jpg', 'assets/tresaith-waterfall.webm'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.headers.has('range')) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && new URL(e.request.url).origin !== location.origin) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => hit)));
});
