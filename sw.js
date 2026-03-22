const CACHE = 'dare-v1';
const ASSETS = ['/app.html', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/app.html')))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: '⚡ Défi reçu !', body: 'Tu as 4h pour relever ton défi dare.' };
  e.waitUntil(
    self.registration.showNotification(data.title || '⚡ dare. — Défi reçu !', {
      body: data.body || 'Ton défi du jour est disponible. Tu as 4h.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'dare-defi',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: '/app.html' },
      actions: [
        { action: 'open', title: 'Voir le défi' },
        { action: 'later', title: 'Plus tard' }
      ]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action !== 'later') {
    e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
      const c = cs.find(c => c.url.includes('app.html'));
      if (c) return c.focus();
      return clients.openWindow('/app.html');
    }));
  }
});
