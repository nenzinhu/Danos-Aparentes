/* Service Worker — Danos Aparentes PWA
 * Mínimo necessário para o app ser instalável + cache básico (network-first).
 */
const CACHE = 'danos-aparentes-v1'

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

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request)
        // guarda apenas respostas válidas e same-origin no cache
        if (fresh && fresh.ok && new URL(request.url).origin === self.location.origin) {
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
