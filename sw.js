const CACHE = 'darwin-shell-v1';
const CORE = [
  './', './index.html', './manifest.webmanifest', './assets/icon.svg',
  './css/base.css', './css/layout.css', './css/components.css', './css/theme.css', './css/mobile.css',
  './js/main.js', './js/router.js', './js/state.js', './js/ui.js', './js/accessibility.js',
  './engine/scale-engine.js', './engine/process-engine.js', './engine/concept-engine.js', './engine/feedback-engine.js', './engine/diagram-engine.js',
  './components/home-hero.js', './components/module-card.js', './components/application-card.js', './components/glossary-panel.js',
  './data/axes.json', './data/modules.json', './data/scales.json', './data/processes.json', './data/applications.json', './data/glossary.json', './data/exercises.json', './data/editorial.json'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('darwin-') && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === location.origin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => new Response('Conteúdo ainda não está disponível offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))));
});
