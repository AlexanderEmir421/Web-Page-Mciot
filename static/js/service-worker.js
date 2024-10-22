self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.open('offline-cache').then(function(cache) {
                return cache.match('/offline.html');
            });
        })
    );
});

// Instalar el Service Worker y almacenar la página offline en el cache
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('offline-cache').then(function(cache) {
            return cache.addAll([
                '/offline.html', // Página que mostrarás cuando se pierda la conexión
                '/static/css/registerdevice.css',
                '/static/js/registerdevice.js',
                'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js'
            ]);
        })
    );
});