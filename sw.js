// Offline cache so the card works in the field without signal.
// Always checks the server first (bypassing the browser's HTTP cache), so updates show on the next load.
const CACHE = 'field-card-v12';
const FILES = [
  './', 'index.html', 'styles.css?v=12', 'app.js?v=12',
  'assets/golden.jpg', 'assets/overcast.jpg', 'assets/hazy.jpg', 'assets/midday.jpg',
  'assets/athmuqam-waterfall-long-exposure.jpg',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];
const warm = () => caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))));
self.addEventListener('install', e => e.waitUntil(warm().then(() => self.skipWaiting())));
// Other apps on this site clear caches they don't recognise, so the page asks us to re-save on each online visit.
self.addEventListener('message', e => {
  if (e.data === 'warm') e.waitUntil(caches.has(CACHE).then(has => has ? caches.open(CACHE).then(c => c.keys()).then(k => k.length < FILES.length ? warm() : null) : warm()).catch(() => {}));
});
self.addEventListener('activate', e => e.waitUntil(
  // Only clear this app's old caches: other apps on this GitHub Pages site share the same storage.
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('field-card-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
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
