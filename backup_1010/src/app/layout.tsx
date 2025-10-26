// src/app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// import SessionProvider from '@/components/SessionProvider';
import ClientProviders from './ClientProviders'
import { prisma } from '@/lib/db';
import { unbounded } from './fonts';

export const metadata: Metadata = {
  title: 'Kiddeo — афиша и маркетплейс',
  description:
    'Единая платформа с мероприятиями, услугами и местами для детей в вашем городе.',
};

export const viewport: Viewport = {
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
  // Временно убираем Prisma запрос для диагностики
  const cities: { slug: string; name: string }[] = [
    { slug: 'moskva', name: 'Москва' },
    { slug: 'sankt-peterburg', name: 'Санкт-Петербург' }
  ];

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${unbounded.variable} min-h-dvh flex flex-col bg-white text-slate-900 antialiased`}>
        <ClientProviders>
          <Header cities={cities} />
          <main className="flex-1">{children}</main>
          <Footer citySlug="moskva" />
        </ClientProviders>
      </body>
    </html>
  );
}
