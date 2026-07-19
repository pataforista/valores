/* Valores del Valle CACB — SW (cache simple) */

// Cambio versión para forzar actualización
const CACHE_NAME = "valores-del-valle-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./outfit.css",
  "./galaxy.js",
  "./manifest.json",
  "./favicon.svg",
  "./vendor/gsap.min.js",
  "./vendor/chart.umd.min.js",
  "./src/main.js",
  "./src/dom.js",
  "./src/illustrations.js",
  "./src/utils.js",
  "./src/values.js",
  "./src/audio.js",
  "./src/bullseye.js",
  "./src/avatar.js",
  "./src/ui_values.js",
  "./src/sos.js",
  "./src/ui_path.js",
  "./src/export.js",
  "./src/achievements.js",
  "./src/glossary.js",
  "./src/notifications.js",
  "./src/offlineIndicator.js",
  "./src/onboarding.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./assets/trabajo_educacion.png",
  "./assets/relaciones.png",
  "./assets/crecimiento.png",
  "./assets/ocio.png",
  "./fonts/outfit-latin-400-normal.woff2",
  "./fonts/outfit-latin-600-normal.woff2",
  "./fonts/outfit-latin-700-normal.woff2",
  "./fonts/outfit-latin-800-normal.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => { })
  );
  // Eliminado self.skipWaiting() para permitir el patrón de actualización mediante banner (esperar a que el usuario confirme)
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();

  // Notify open clients that a new service worker version activated
  self.clients.matchAll({ type: 'window' }).then(clients => {
    for (const c of clients) {
      try {
        c.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
      } catch (e) { /* ignore */ }
    }
  });
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (!req.url.startsWith("http")) return;

  // Network-first for navigation requests (prevents permanent cache lock)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => { });
          }
          return res;
        })
        .catch(() => {
          return caches.match("./index.html");
        })
    );
    return;
  }

  // Cache-first with network fallback for other resources
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200 || res.type === "error") return res;

          if (new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => { });
          }
          return res;
        })
        .catch(() => {
          return cached;
        });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
