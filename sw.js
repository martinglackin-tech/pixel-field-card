// The app moved to https://pixel-field-card.martinglackin.workers.dev/. Installed copies still check this file
// for updates, so this worker deletes the old offline copy and removes itself.
// Only field-card-* caches: every app on this GitHub Pages site shares Cache Storage.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('field-card-')).map(k => caches.delete(k)));
  await self.registration.unregister();
  for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
})()));
