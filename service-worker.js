
const CACHE = 'ifc-pro-v2';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icons/wood-cube-ruler-192.png',
  './icons/wood-cube-ruler-512.png'
];
const CDN = [
  'https://unpkg.com/web-ifc-viewer@0.0.132/dist/ifc.min.js',
  'https://unpkg.com/web-ifc@0.0.43/',
  'https://unpkg.com/three@0.160.0/build/three.module.js'
];
self.addEventListener('install', (e)=>{
  e.waitUntil((async ()=>{
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    try { await cache.addAll(CDN); } catch(_) {}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.map(k=> k===CACHE ? null : caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  } else if (url.hostname.includes('unpkg.com')) {
    e.respondWith((async ()=>{
      const cache = await caches.open(CACHE);
      const cached = await cache.match(e.request);
      if (cached) return cached;
      try {
        const res = await fetch(e.request, {mode:'cors'});
        cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        return new Response('Offline CDN', {status:503});
      }
    })());
  }
});
