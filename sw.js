
const CACHE_NAME = "frecuencia-manabita-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./estilo.css",
  "./script.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instalación
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activación
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch (caché + network)
self.addEventListener("fetch", (event) => {
  // No cacheamos el stream de audio (importante)
  if (event.request.url.includes("radiojar.com") || event.request.url.includes("stream")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
