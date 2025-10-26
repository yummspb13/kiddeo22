import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KidsReview',
    short_name: 'KidsReview',
    description: 'Маркетплейс детских праздников и семейной афиши.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ru',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['events', 'shopping', 'kids'],
    shortcuts: [
      { name: 'Афиша', url: '/city/moskva', description: 'События для детей' },
      { name: 'Каталог услуг', url: '/city/moskva/cat/uslugi', description: 'Площадки и услуги' },
    ],
  }
}
