/* eslint-disable no-restricted-globals */
const VERSION = 'v2.0.0'
const STATIC_CACHE = `static-${VERSION}`
const HTML_CACHE = `html-${VERSION}`
const API_CACHE = `api-${VERSION}`
const IMAGE_CACHE = `images-${VERSION}`

const APP_SHELL = [
  '/',                       // главная
  '/offline',                // оффлайн-страница
  '/manifest.webmanifest',   // манифест
  '/icons/icon-192.png',     // иконка
  '/icons/icon-512.png',     // иконка
]

// Критичные API endpoints для офлайн работы
const CRITICAL_APIS = [
  '/api/cities',
  '/api/categories',
  '/api/homepage/content?citySlug=moscow'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(API_CACHE).then((cache) => 
        Promise.all(CRITICAL_APIS.map(url => 
          fetch(url).then(res => cache.put(url, res)).catch(() => {})
        ))
      )
    ])
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, HTML_CACHE, API_CACHE, IMAGE_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      ),
      self.clients.claim()
    ])
  )
})

// Background Sync для офлайн действий
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-favorites') {
    event.waitUntil(syncFavorites())
  }
  if (event.tag === 'background-sync-cart') {
    event.waitUntil(syncCart())
  }
})

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view-event' && event.notification.data?.eventId) {
    event.waitUntil(
      clients.openWindow(`/event/${event.notification.data.eventId}`)
    )
  } else if (event.action === 'view-orders') {
    event.waitUntil(
      clients.openWindow('/profile/orders')
    )
  } else {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

/**
 * Стратегии кеширования:
 * - HTML: Network First с оффлайн-фоллбеком
 * - API: Network First с кешированием
 * - Статика: Stale While Revalidate
 * - Изображения: Cache First с fallback
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

  // API запросы
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          if (fresh.ok) {
            const cache = await caches.open(API_CACHE)
            cache.put(req, fresh.clone())
          }
          return fresh
        } catch (err) {
          const cache = await caches.open(API_CACHE)
          const cached = await cache.match(req)
          return cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      })()
    )
    return
  }

  // Изображения
  if (
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE)
        const cached = await cache.match(req)
        
        if (cached) return cached

        try {
          const fresh = await fetch(req)
          if (fresh.ok) {
            cache.put(req, fresh.clone())
          }
          return fresh
        } catch (err) {
          // Fallback изображение
          return new Response('', { status: 404 })
        }
      })()
    )
    return
  }

  // Статика (JS, CSS, fonts)
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(req)
        
        if (cached) {
          // Обновляем в фоне
          fetch(req).then(res => {
            if (res.ok) cache.put(req, res.clone())
          }).catch(() => {})
          return cached
        }

        try {
          const fresh = await fetch(req)
          if (fresh.ok) {
            cache.put(req, fresh.clone())
          }
          return fresh
        } catch (err) {
          return new Response('', { status: 404 })
        }
      })()
    )
  }
})

// Background sync functions
async function syncFavorites() {
  try {
    const pendingFavorites = await getPendingFavorites()
    for (const favorite of pendingFavorites) {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favorite)
      })
    }
    await clearPendingFavorites()
  } catch (error) {
    console.error('Failed to sync favorites:', error)
  }
}

async function syncCart() {
  try {
    const pendingCart = await getPendingCart()
    if (pendingCart.length > 0) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pendingCart })
      })
      await clearPendingCart()
    }
  } catch (error) {
    console.error('Failed to sync cart:', error)
  }
}

// IndexedDB helpers for offline data
async function getPendingFavorites() {
  // Implementation would use IndexedDB
  return []
}

async function clearPendingFavorites() {
  // Implementation would use IndexedDB
}

async function getPendingCart() {
  // Implementation would use IndexedDB
  return []
}

async function clearPendingCart() {
  // Implementation would use IndexedDB
}
