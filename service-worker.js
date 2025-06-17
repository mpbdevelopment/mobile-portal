const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  // Add other assets like CSS, JS, or images here
];

// Install the service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Serve cached assets when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Update the cache if assets have changed
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

/* ------------------ Push & click handlers you add -------------------- */
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {};
  const title = data.title ?? 'Montclair Pickleball';
  const options = {
    body:  data.body  ?? 'Come join us this week!',
    icon:  '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data:  { url: data.url ?? '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data.url;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(ws => {
        for (const w of ws) if (w.url === url && 'focus' in w) return w.focus();
        return clients.openWindow(url);
      })
  );
});
