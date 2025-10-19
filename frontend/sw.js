const CACHE_NAME = 'primevision-v1';
// This list should only contain files that actually exist.
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/views/login.html',
    '/views/favourites.html',
    '/views/explore.html',
    '/views/profile.html',
    '/views/subscription.html',
    '/views/auth-success.html',
        '/images/interstellar.jpg',
        '/images/breakingbad.avif' 
    // Since your CSS and JS are in the HTML, you don't list them here.
];

// Caching the App Shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching App Shell...');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Serving files and caching new images dynamically
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(
                    (networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        const requestUrl = event.request.url;
                        if (requestUrl.match(/\.(png|jpg|jpeg|webp|gif|svg|avif)$/)) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    }
                );
            })
    );
});