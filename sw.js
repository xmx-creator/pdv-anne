// Troque o número da versão sempre que mudar o index.html, para o celular pegar a novidade.
const VERSAO = 'anne-patisserie-v4';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
// As fontes do Google também ficam guardadas, para a tela ter o mesmo visual sem internet.
const FONTES = ['fonts.googleapis.com', 'fonts.gstatic.com'];

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
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const mesmaOrigem = url.origin === location.origin;
  if (!mesmaOrigem && !FONTES.includes(url.hostname)) return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: mesmaOrigem}).then(guardado => {
      const rede = fetch(e.request).then(resp => {
        if (resp.ok || resp.type === 'opaque') { const copia = resp.clone(); caches.open(VERSAO).then(c => c.put(e.request, copia)); }
        return resp;
      }).catch(() => guardado || (mesmaOrigem ? caches.match('./index.html') : Response.error()));
      return guardado || rede;
    })
  );
});
