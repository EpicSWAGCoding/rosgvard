const CACHE_NAME = 'rosgvard-cache-v1';
const ASSETS = [ '/', '/index.html' ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data.json(); } catch (e) {}
  const title = data.title || 'Уведомление';
  const options = { body: data.body || '', data: data.data };
  event.waitUntil(self.registration.showNotification(title, options));
});
