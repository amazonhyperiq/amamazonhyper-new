const CACHE_NAME = "amazonhyper-app-v7";

const APP_SHELL = [
  "./",
  "./index.html",
  "./admin.html",
  "./style.css?v=6.0",
  "./app.js?v=6.0",
  "./manifest.webmanifest",
  "./icons/categories/baby.jpg",
  "./icons/categories/bakery.jpg",
  "./icons/categories/canned.jpg",
  "./icons/categories/chicken.jpg",
  "./icons/categories/cleaning.jpg",
  "./icons/categories/coffee-tea.jpg",
  "./icons/categories/dairy.jpg",
  "./icons/categories/drinks.jpg",
  "./icons/categories/food.jpg",
  "./icons/categories/frozen.jpg",
  "./icons/categories/fruits.jpg",
  "./icons/categories/grains.jpg",
  "./icons/categories/household.jpg",
  "./icons/categories/meat.jpg",
  "./icons/categories/nuts.jpg",
  "./icons/categories/personal-care.jpg",
  "./icons/categories/seafood.jpg",
  "./icons/categories/spices.jpg",
  "./icons/categories/sweets.jpg",
  "./icons/categories/vegetables.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isDocument = event.request.mode === "navigate" || url.pathname.endsWith(".html");
  const isAppCode = url.pathname.endsWith(".js") || url.pathname.endsWith(".css");

  // Keep page/code updates fresh so a new deployment is not trapped behind old cache.
  if (isDocument || isAppCode) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
