/*
 * Kill switch for the legacy Create React App service worker.
 *
 * The previous maxharding4.com site (CRA) registered a service worker at this
 * path that aggressively cached the app shell. Returning visitors still have it
 * installed and would keep seeing the old site after the migration. Because
 * browsers re-fetch the worker from this same path, replacing it with the code
 * below makes those clients unregister it, drop all caches, and reload onto the
 * new site. The current (Next.js) site does not use a service worker.
 *
 * This file can be deleted once enough time has passed that returning visitors
 * with the old worker are negligible.
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => undefined)
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
  );
});
