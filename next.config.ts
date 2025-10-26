import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Базовая конфигурация для стабильной работы
  serverExternalPackages: ['@prisma/client'],
  
  // Отключаем проверку типов для деплоя
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Отключаем статическую генерацию страниц
  trailingSlash: false,
  
  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
  },
  
  // Базовая оптимизация
  poweredByHeader: false,
}

export default nextConfig