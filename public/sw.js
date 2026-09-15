const CACHE = 'sonya-v2';
// URLs resolve relative to sw.js, retaining a GitHub Pages repository subdirectory.
const APP = ['./', './index.html', './src/app.js', './src/core.js', './src/styles.css', './icon.svg', './manifest.webmanifest'];
const FALLBACK = new URL('./index.html', self.location.href).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('sonya-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    }
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match(FALLBACK) : Response.error())));
});
