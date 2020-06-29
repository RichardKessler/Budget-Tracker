const FILES_TO_CACHE = [
    '/',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.webmanifest',
    '/styles.css'
];

const CACHE_NAME = 'statck-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// install
self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Pre-cache success!!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate!', (evt) => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log('Clearing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.ClientRectList.claim();
});

//fetching
self.addEventListener('fetch!', (evt) => {
    if(evt.request.url.includes('/api/')){
        evt.resondWith(
            caches.open(DATA_CACHE_NAME).then(cahce => {
                return fetch(evt.request)
                .then(response => {
                    if(response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );
        return;
    }
    evt.respondWith(
        caches.match(evt.request).then((res) => {
            return res || fetch(evt.request);
        })
    );
});