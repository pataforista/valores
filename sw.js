/* Valores del Valle CACB — SW (cache simple) */

// Cambio versión para forzar actualización
const CACHE_NAME = "valores-del-valle-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./outfit.css",
  "./galaxy.js",
  "./manifest.json",
  "./src/main.js",
  "./src/utils.js",
  "./src/values.js",
  "./src/audio.js",
  "./src/bullseye.js",
  "./src/avatar.js",
  "./src/ui_values.js",
  "./src/sos.js",
  "./src/ui_path.js",
  "./src/export.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => { })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => { });
          return res;
        })
        .catch(() => cached);
    })
  );
});