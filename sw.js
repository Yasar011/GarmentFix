// Brandix QC — service worker (offline shell + auto-update)
// Caches the app shell and CDN libraries so the app opens on flaky factory wifi,
// while letting all Firebase realtime/auth traffic go straight to the network.
const CACHE = 'brandix-qc-v1';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept live data — Firebase realtime DB + auth must always hit the network.
  if (/firebaseio|firebasedatabase|identitytoolkit|securetoken|google-analytics|gstatic\.com\/firebasejs/.test(url.href)) return;

  // Page loads: network-first (so edits show up), fall back to cached copy when offline.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const c = await caches.open(CACHE);
        c.put(req, net.clone());
        return net;
      } catch (_) {
        return (await caches.match(req)) || (await caches.match('QCworker.html')) || Response.error();
      }
    })());
    return;
  }

  // Other assets (scripts, styles, fonts, CDN libs): serve cache fast, refresh in background.
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const fetching = fetch(req).then(res => {
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    return cached || fetching;
  })());
});
