/* Rampart Field Kit service worker. Cache-first so the kit runs with no signal. */
const CACHE = 'rampart-v26';
const ASSETS = [
  './',
  'index.html',
  'theme.css',
  'tumbler.html',
  'credential.html',
  'picket.html',
  'safeconduct.html',
  'sweep.html',
  'aether.html',
  'docket.html',
  'footprint.html',
  'touchstone.html',
  'quartermaster.html',
  'primer.html',
  'exhibit.html',
  'flux.html',
  'lumen.html',
  'gauge.html',
  'remit.html',
  'debrief.html',
  'lexicon.html',
  'preflight.html',
  'acoustic.html',
  'patrol.html',
  'sightline.html',
  'cache.html',
  'gate.js',
  'core.js',
  'kit.js',
  'media.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      // runtime cache same-origin successful responses
      if (res && res.ok && new URL(req.url).origin === self.location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
