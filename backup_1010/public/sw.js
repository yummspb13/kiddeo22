/* eslint-disable no-restricted-globals */
const VERSION = 'v1.0.0'
const STATIC_CACHE = `static-${VERSION}`
const HTML_CACHE = `html-${VERSION}`

const APP_SHELL = [
  '/',                       // главная
  '/offline',                // оффлайн-страница
  '/manifest.webmanifest',   // манифест (Next отдаёт как /manifest.webmanifest)
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, HTML_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

/**
 * Навигационные запросы (HTML) — Network First с оффлайн-фоллбеком.
 * Статика (_next/static, /icons/, /images/) — Stale While Revalidate.
 */
self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  // только GET кешируем
  if (req.method !== 'GET') return

  // HTML навигация
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          const cache = await caches.open(HTML_CACHE)
          cache.put(req, fresh.clone())
          return fresh
        } catch (err) {
          const cache = await caches.open(HTML_CACHE)
          const cached = await cache.match(req)
          return cached || caches.match('/offline')
        }
      })()
    )
    return
  }

  // статика
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(req)
        const network = fetch(req)
          .then((res) => {
            cache.put(req, res.clone())
            return res
          })
          .catch(() => cached)
        return cached || network
      })()
    )
  }
})
