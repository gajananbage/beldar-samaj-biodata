const CACHE_NAME = 'biodata-v1';
// List all files you want to cache (GitHub/Netlify are case-sensitive)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // External Libraries (must use their full URLs)
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700&family=Dancing+Script:wght@700&family=Open+Sans:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  // Your Local Icons (MUST be present in /icons/ folder)
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
        // Ensure that all files in urlsToCache are available
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
          console.error('Failed to cache files during install (check for 404s):', err);
          // If caching fails, the SW installation fails.
      })
  );
});

// --- 2. Fetch Assets (Cache first strategy) ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // No cache match - fetch from network
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response (200 OK)
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // If the request is for an external resource (CORS/opaque), caching it might not work well, 
            // but for local resources, cache the response.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Do not cache Chrome DevTools requests
                if (!event.request.url.startsWith('chrome-extension')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(error => {
            // Network fetch failed (e.g., truly offline)
            console.log('Fetch failed; network offline or resource unavailable.');
            // You can add logic here to serve an offline page (if cached)
        });
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
            // Delete old cache versions
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
