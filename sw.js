// Offline cache so the card works in the field without signal.
// Always checks the server first (bypassing the browser's HTTP cache), so updates show on the next load.
const CACHE = 'field-card-v8';
const FILES = [
  './', 'index.html', 'styles.css?v=8', 'app.js?v=8',
  'assets/golden.jpg', 'assets/overcast.jpg', 'assets/hazy.jpg', 'assets/midday.jpg',
  'assets/athmuqam-waterfall-long-exposure.jpg'
];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const sameOrigin = new URL(req.url).origin === location.origin;
  const fresh = sameOrigin ? fetch(req, { cache: 'no-cache' }) : fetch(req);
  e.respondWith(
    fresh.then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))
  );
});
