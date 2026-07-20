/* Valores del Valle CACB — SW (cache simple) */

// Cambio versión para forzar actualización
const CACHE_NAME = "valores-del-valle-v13";
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
  self.skipWaiting(); // Fuerza la instalación inmediata del nuevo SW
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => { })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim(); // Toma el control de inmediato
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;

  // Estrategia Global: Network First (Prioridad Red, respaldo Caché)
  // Garantiza que siempre se obtenga la versión más reciente si hay internet,
  // y que siga funcionando offline si no hay conexión.
  event.respondWith(
    fetch(req)
      .then((res) => {
        // Guardamos copia en caché de respuestas válidas de nuestro dominio
        if (res && res.status === 200 && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => { });
        }
        return res;
      })
      .catch(() => {
        // Si falla la red (offline), intentamos buscar en la caché
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          // Fallback para navegación offline si no se encuentra la ruta exacta
          if (req.mode === "navigate") return caches.match("./index.html");
          return null;
        });
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
