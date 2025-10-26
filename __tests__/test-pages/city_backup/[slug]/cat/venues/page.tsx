import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import VenuesClient from './VenuesClient';
import { Unbounded } from 'next/font/google';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VenuesPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  // Получаем город
  const city = await prisma.city.findUnique({
    where: { slug, isPublic: true },
    select: { id: true, name: true, slug: true },
  });

  if (!city) {
    notFound();
  }

  // Получаем места/услуги
  const rawVenues = await prisma.listing.findMany({
    where: {
      cityId: city.id,
      type: { in: ['VENUE', 'SERVICE'] },
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      address: true,
      priceFrom: true,
      priceTo: true,
      isFree: true,
      isIndoor: true,
      district: true,
      images: true,
      vendor: {
        select: {
          id: true,
          displayName: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  // Добавляем reviews: 0 для совместимости с фронтендом
  const venues = rawVenues.map((v: any) => ({
    ...v,
    _count: { ...(v._count ?? {}), reviews: v._count?.reviews ?? 0 },
  }))

  // Получаем категории для фильтрации
  const categories = await prisma.category.findMany({
    where: {
      listings: {
        some: {
          cityId: city.id,
          type: { in: ['VENUE', 'SERVICE'] },
          isActive: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Header */}
      <header className="bg-gray-800 text-white">
        <div className="bg-yellow-400 text-black text-center py-2">
          <h1 className="text-2xl font-bold">МЕСТА ДЛЯ ДЕТЕЙ</h1>
        </div>
        <div className="bg-white text-black">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-red-600 text-2xl font-bold">KidsReview</div>
              <nav className="flex space-x-6">
                <a href="#" className="hover:text-red-600 transition-colors">АФИША</a>
                <a href="#" className="hover:text-red-600 transition-colors font-bold">МЕСТА</a>
                <a href="#" className="hover:text-red-600 transition-colors">ПРАЗДНИКИ</a>
                <a href="#" className="hover:text-red-600 transition-colors">БЛОГ</a>
                <a href="#" className="hover:text-red-600 transition-colors">О НАС</a>
                <span className="text-gray-400">...</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                ВОЙТИ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Места в {city.name}</h1>
          <p className="text-xl mb-8">Найдите интересные места для всей семьи</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="text" 
              placeholder="Поиск мест..." 
              className="px-6 py-3 rounded-lg text-gray-900 w-full sm:w-96"
            />
            <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
              Найти
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories Section - Mosaic Style */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-lg">🏰</span>
            </div>
            <h2 className="text-3xl font-bold">Категории мест</h2>
          </div>
          <p className="text-gray-600 mb-8">Выберите интересующую вас категорию</p>
          
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {/* Category 1 - Large - Cafes */}
            <div 
              className="relative text-white p-6 rounded-lg mb-6 break-inside-avoid cursor-pointer hover:shadow-xl transition-shadow overflow-hidden"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3">🍕</div>
                <h4 className="text-xl font-bold mb-2">Кафе и рестораны</h4>
                <p className="text-white/90 mb-4">Детские кафе, семейные рестораны с детским меню</p>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block">25+ мест</div>
              </div>
            </div>

            {/* Category 2 - Medium - Parks */}
            <div 
              className="relative text-white p-4 rounded-lg mb-6 break-inside-avoid cursor-pointer hover:shadow-xl transition-shadow overflow-hidden"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-2">🌳</div>
                <h4 className="text-lg font-bold mb-1">Парки и скверы</h4>
                <p className="text-white/90 text-sm mb-3">Детские площадки, парки развлечений</p>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full inline-block">Бесплатно</div>
              </div>
            </div>

            {/* Category 3 - Small - Museums */}
            <div 
              className="relative text-white p-4 rounded-lg mb-6 break-inside-avoid cursor-pointer hover:shadow-xl transition-shadow overflow-hidden"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-2">🏛️</div>
                <h4 className="font-bold">Музеи</h4>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full inline-block mt-2">От 200 ₽</div>
              </div>
            </div>

            {/* Category 4 - Medium - Entertainment */}
            <div 
              className="relative text-white p-4 rounded-lg mb-6 break-inside-avoid cursor-pointer hover:shadow-xl transition-shadow overflow-hidden"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-2">🎪</div>
                <h4 className="text-lg font-bold mb-1">Развлечения</h4>
                <p className="text-white/90 text-sm mb-3">Игровые центры, аттракционы, квесты</p>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full inline-block">От 500 ₽</div>
              </div>
            </div>

            {/* Category 5 - Small - Sports */}
            <div 
              className="relative text-white p-4 rounded-lg mb-6 break-inside-avoid cursor-pointer hover:shadow-xl transition-shadow overflow-hidden"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-2">⚽</div>
                <h4 className="font-bold">Спорт</h4>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full inline-block mt-2">От 300 ₽</div>
              </div>
            </div>

            {/* Category 6 - Large - Education */}
            <div 
              className="relative text-white p-6 rounded-lg mb-6 break-inside-avoid cursor-pointer hover:shadow-xl transition-shadow overflow-hidden"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3">🎨</div>
                <h4 className="text-xl font-bold mb-2">Образование</h4>
                <p className="text-white/90 mb-4">Кружки, секции, развивающие центры для детей</p>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block">30+ мест</div>
              </div>
            </div>
          </div>
        </section>

        {/* Venues Grid */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Все места</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Сортировка:</span>
              <select className="bg-white rounded-lg px-4 py-2 border">
                <option>По популярности</option>
                <option>По цене</option>
                <option>По рейтингу</option>
              </select>
            </div>
          </div>

          <Suspense fallback={<VenuesSkeleton />}>
            <VenuesClient
              initialVenues={venues}
              categories={categories}
              city={city}
              searchParams={sp}
            />
          </Suspense>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* App Download */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Приложение KidsReview</h3>
                  <p className="text-sm text-gray-600 mb-4">Найдите места в несколько кликов</p>
                  <div className="space-y-2">
                    <div className="bg-black text-white px-4 py-2 rounded text-sm">App Store</div>
                    <div className="bg-black text-white px-4 py-2 rounded text-sm">Google Play</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Разделы</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><a href="#" className="hover:text-red-600">Афиша</a></li>
                    <li><a href="#" className="hover:text-red-600">Места</a></li>
                    <li><a href="#" className="hover:text-red-600">Праздники</a></li>
                    <li><a href="#" className="hover:text-red-600">Блог</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Партнёрам</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><a href="#" className="hover:text-red-600">Добавить место</a></li>
                    <li><a href="#" className="hover:text-red-600">Стать партнером</a></li>
                    <li><a href="#" className="hover:text-red-600">Реклама</a></li>
                    <li><a href="#" className="hover:text-red-600">Партнерство</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Помощь</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><a href="#" className="hover:text-red-600">Контакты</a></li>
                    <li><a href="#" className="hover:text-red-600">Поддержка</a></li>
                    <li><a href="#" className="hover:text-red-600">FAQ</a></li>
                    <li><a href="#" className="hover:text-red-600">Обратная связь</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Информация</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li><a href="#" className="hover:text-red-600">О проекте</a></li>
                    <li><a href="#" className="hover:text-red-600">Пользовательское соглашение</a></li>
                    <li><a href="#" className="hover:text-red-600">Политика конфиденциальности</a></li>
                    <li><a href="#" className="hover:text-red-600">Правовая информация</a></li>
                  </ul>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="mt-8 flex items-center space-x-4">
                <span className="text-sm text-gray-600">Мы в соцсетях:</span>
                <div className="flex space-x-2">
                  <a href="#" className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">VK</a>
                  <a href="#" className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">TG</a>
                  <a href="#" className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">OK</a>
                </div>
              </div>
              
              {/* Copyright */}
              <div className="mt-8 text-sm text-gray-500">
                <p>© 2025 KidsReview. Все права защищены.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function VenuesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 bg-slate-200 rounded-full animate-pulse"
          />
        ))}
      </div>

      {/* Сетка мест */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse"
          >
            <div className="aspect-video bg-slate-200 rounded-lg mb-4" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
