const CACHE_NAME = 'biodata-v1';
// List all files you want to cache (your HTML, CSS, JS, and icons)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // You must include all external libraries used
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700&family=Dancing+Script:wght=700&family=Open+Sans:wght=400;700&family=Noto+Sans+Devanagari:wght{400;700}&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  // Ensure your icons are also cached (assuming you created the 'icons' folder)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png' 
];

// --- 1. Install Service Worker & Cache Assets ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, pre-caching all assets.');
        return cache.addAll(urlsToCache);
      })
  );
});

// --- 2. Fetch Assets (Serving from Cache first) ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache match - fetch from network
        return fetch(event.request);
      })
  );
});

// --- 3. Activate & Clean up old caches ---
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
