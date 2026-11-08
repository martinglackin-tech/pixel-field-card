// Served as sw.js on the old Netlify address only (see netlify.toml). It deletes the old
// offline copy, removes itself and reloads the page, which then redirects to the new address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('field-card-')).map(k => caches.delete(k)));
  await self.registration.unregister();
  for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
})()));
