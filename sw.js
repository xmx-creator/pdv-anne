// Troque o número da versão sempre que mudar o index.html, para o celular pegar a novidade.
const VERSAO = 'pdv-anne-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Abre do cache (funciona sem internet) e atualiza o cache em segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(guardado => {
      const rede = fetch(e.request).then(resp => {
        if (resp.ok) { const copia = resp.clone(); caches.open(VERSAO).then(c => c.put(e.request, copia)); }
        return resp;
      }).catch(() => guardado || caches.match('./index.html'));
      return guardado || rede;
    })
  );
});
