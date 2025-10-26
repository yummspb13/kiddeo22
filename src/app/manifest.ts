import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kiddeo — афиша и маркетплейс',
    short_name: 'Kiddeo',
    description: 'Единая платформа с мероприятиями, услугами и местами для детей в вашем городе.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'ru',
    background_color: '#ffffff',
    theme_color: '#7e22ce', // brand-from color
    icons: [
      { src: '/favicon.ico', sizes: '32x30', type: 'image/x-icon' },
      { src: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { src: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
      { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
      { src: '/icons/icon-maskable-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['events', 'shopping', 'kids', 'lifestyle'],
    shortcuts: [
      { 
        name: 'События', 
        url: '/city/moscow/events', 
        description: 'Все события для детей',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }]
      },
      { 
        name: 'Места', 
        url: '/city/moscow/cat/venues', 
        description: 'Площадки и места',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }]
      },
      { 
        name: 'Мои заказы', 
        url: '/profile/orders', 
        description: 'История заказов',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }]
      },
      { 
        name: 'Избранное', 
        url: '/profile/favorites', 
        description: 'Сохраненные события',
        icons: [{ src: '/icons/icon-192.svg', sizes: '192x192' }]
      },
    ],
    screenshots: [],
    related_applications: [],
    prefer_related_applications: false
  }
}
