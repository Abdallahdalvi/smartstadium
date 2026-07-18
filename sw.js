/**
 * @fileoverview Service Worker for Smart Stadium PWA
 * Provides offline capabilities and static asset caching
 */

const CACHE_NAME = 'smart-stadium-v1';
const ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/animations.css',
  './js/utils.js',
  './js/knowledge-base.js',
  './js/i18n.js',
  './js/ai-engine.js',
  './js/wayfinding.js',
  './js/heatmap.js',
  './js/tickets.js',
  './js/emergency.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Try network first, then cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
