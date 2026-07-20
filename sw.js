/* ═══════════════════════════════════════════════════════════════
   TripNexus: service worker (PWA)
   Estratégia: a casca da aplicação (HTML, CSS, JS, ícones) é
   guardada em cache para arranque rápido e uso offline; os pedidos
   de rede (tarifas reais, mapas, fotografias) passam sempre pela
   rede e nunca são servidos de cache obsoleta.
   ═══════════════════════════════════════════════════════════════ */

const VERSAO = 'tripnexus-v22';
const CASCA = [
  './',
  './index.html',
  './assets/css/style.css?v=22',
  './assets/js/data.js?v=22',
  './assets/js/engine.js?v=22',
  './assets/js/calendar.js?v=22',
  './assets/js/live.js?v=22',
  './assets/js/alertas.js?v=22',
  './assets/js/app.js?v=22',
  './assets/img/logo.svg',
  './assets/img/favicon.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(chaves => Promise.all(
      chaves.filter(k => k !== VERSAO).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  /* apenas a casca no mesmo domínio é servida de cache;
     tudo o resto (APIs, mapas, imagens externas) vai à rede */
  if(url.origin !== location.origin) return;

  e.respondWith(
    caches.match(req, {ignoreSearch: false}).then(hit => {
      if(hit) return hit;
      return fetch(req).then(resp => {
        if(resp.ok && (req.destination === 'script' || req.destination === 'style' ||
                       req.destination === 'image' || req.destination === 'document')){
          const copia = resp.clone();
          caches.open(VERSAO).then(c => c.put(req, copia));
        }
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
