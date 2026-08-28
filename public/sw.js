const VERSION = 'pocket-reconcile-__BUILD_VERSION__';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const BUILD_ASSETS = [/* __APP_SHELL_ASSETS__ */];
const PRECACHE = ['/', '/demo/', '/offline.html', '/privacy/', '/terms/', '/manifest.webmanifest', '/icons/icon.svg', '/icons/apple-touch-icon.png', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/assets/pressed-ledger-384.webp', '/assets/pressed-ledger.webp', '/assets/pressed-ledger.jpg', ...BUILD_ASSETS];

self.addEventListener('install', event => {
  const requests = PRECACHE.map(url => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => ![SHELL, RUNTIME].includes(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone(); caches.open(RUNTIME).then(cache => cache.put(request, copy)); return response;
    }).catch(async () => (await caches.match(request, { ignoreVary: true })) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }

  event.respondWith(caches.match(request, { ignoreVary: true }).then(cached => cached || fetch(request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(RUNTIME).then(cache => cache.put(request, copy)); }
    return response;
  })));
});
