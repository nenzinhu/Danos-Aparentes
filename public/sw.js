/* Service Worker — Danos Aparentes PWA
 * Cache network-first só para assets estáticos. HTML/navigations = network-only
 * para evitar JS/CSS stale após deploy.
 */
const CACHE = 'danos-aparentes-v2'

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html')
}

function isStaticAsset(url) {
  return /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico|mp3|wav|webm)$/i.test(url.pathname)
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith('http')) return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Documentos / navigations: sempre rede (sem gravar HTML no cache)
  if (isNavigationRequest(request) || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        throw new Error('offline e sem cache')
      })
    )
    return
  }

  // Next.js build chunks / RSC: preferir rede, não cachear _next/data
  if (url.pathname.startsWith('/_next/') && !isStaticAsset(url)) {
    event.respondWith(fetch(request))
    return
  }

  // Assets estáticos: network-first com fallback em cache
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request)
        if (fresh && fresh.ok && isStaticAsset(url)) {
          const copy = fresh.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        }
        return fresh
      } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        throw new Error('offline e sem cache')
      }
    })()
  )
})
