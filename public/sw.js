const CACHE_VERSION = "v1";
const CACHE_NAME = `palpites-shell-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
}

function networkFirstNavigation(request) {
  return fetch(request).catch(() =>
    caches.open(CACHE_NAME).then((cache) => cache.match(request).then((cached) => cached || cache.match("/"))),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
