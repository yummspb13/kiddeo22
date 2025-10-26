// src/app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import SessionDebugger from '@/components/SessionDebugger';
import SessionTest from '@/components/SessionTest';
// import SessionProvider from '@/components/SessionProvider';
import ClientProviders from './ClientProviders'
import ErrorBoundary from '@/components/ErrorBoundary'
import { prisma } from '@/lib/db';
import { unbounded } from './fonts';

export const metadata: Metadata = {
  title: 'Kiddeo — афиша и маркетплейс',
  description:
    'Единая платформа с мероприятиями, услугами и местами для детей в вашем городе.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Получаем список городов из базы данных
  let cities: { slug: string; name: string }[] = [];
  try {
    const citiesData = await prisma.city.findMany({
      select: {
        slug: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    cities = citiesData;
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Fallback если API недоступен
    cities = [
      { slug: 'moscow', name: 'Москва' },
      { slug: 'saint-petersburg', name: 'Санкт-Петербург' }
    ];
  }

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {process.env.YANDEX_MAPS_API_KEY && (
          <script
            src={`https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${process.env.YANDEX_MAPS_API_KEY}`}
            type="text/javascript"
          />
        )}
      </head>
      <body className={`${unbounded.variable} min-h-dvh flex flex-col bg-white text-slate-900 antialiased`}>
        <ErrorBoundary>
          <ClientProviders>
            <Header cities={cities} />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer citySlug="moscow" />
            <BottomNavigation citySlug="moscow" />
            <PWAInstallPrompt />
            <OfflineIndicator />
            {/* <SessionTest /> */}
            {/* <SessionDebugger /> */}
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
