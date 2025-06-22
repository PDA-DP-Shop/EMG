const CACHE_NAME = 'emergency-guide-v9';
const PRECACHE_ASSETS = [
    '/',
    'index.html',
    'fire.html',
    'earthquake.html',
    'firstaid.html',
    'gasleak.html',
    'accident.html',
    'css/style.css',
    'js/main.js',
    'js/pwa.js',
    'js/i18n.js',
    'manifest.json',
    'emergency-numbers.json',

    // Fonts
    'https://fonts.googleapis.com/css?family=Poppins:400,700|Roboto:400,700&display=swap',

    // Main images
    'images/fire.png',
    'images/earthquake.png',
    'images/first-aid.png',
    'images/gas.png',
    'images/crash.png',
    'images/icon-192.png',
    'images/icon-512.png',

    // Accident page images
    'images/car/Call.png',
    'images/car/document.png',
    'images/car/fristaid.png',
    'images/car/light.png',
    'images/car/stop.png',

    // Earthquake page images
    'images/earthquake/exit.png',
    'images/earthquake/help.png',
    'images/earthquake/indoor.png',
    'images/earthquake/table.png',
    'images/earthquake/update.png',

    // Fire page images
    'images/fire/call.png',
    'images/fire/calm.png',
    'images/fire/evacuate.png',
    'images/fire/extinguisher.png',
    'images/fire/no-re-enter.png',

    // First Aid page images
    'images/fristaid/clear.png',
    'images/fristaid/help.png',
    'images/fristaid/monitor.png',
    'images/fristaid/situation.png',
    'images/fristaid/stop.png',

    // Gas leak page images
    'images/gas/Call.png',
    'images/gas/Evacuate.png',
    'images/gas/no-re-enter.png',
    'images/gas/smell.png',
    'images/gas/Ventilate.png',

    // Videos
    'video/car.mp4',
    'video/earthquake.mp4',
    'video/fire.mp4',
    'video/firstaid.mp4',
    'video/gas.mp4',

    // Translation files
    'i18n/en.json',
    'i18n/es.json',
    'i18n/fr.json',
    'i18n/hi.json',
    'i18n/zh.json',
    'i18n/ar.json',
    'i18n/ru.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
    const currentCaches = [CACHE_NAME];
  event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
    // Non-GET requests are not cached
    if (event.request.method !== 'GET') {
        return;
    }

    // For HTML requests, try the network first, fall back to the cache
    if (event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Stash a copy of this page in the cache
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copy);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // For non-HTML requests, try the cache first, fall back to the network
  event.respondWith(
    caches.match(event.request)
            .then(cachedResponse => {
                // Cache hit
                if (cachedResponse) {
                    return cachedResponse;
                }

                // If the request is not in the cache, fetch it from the network
                return fetch(event.request).then(networkResponse => {
                    // Don't cache what we can't see
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                        return networkResponse;
                    }
                    
                    // Don't cache non-http/https requests (e.g., chrome-extension://)
                    if (!networkResponse.url || !networkResponse.url.startsWith('http')) {
                        return networkResponse;
                    }

                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copy);
                    });
                    return networkResponse;
                });
      })
  );
}); 