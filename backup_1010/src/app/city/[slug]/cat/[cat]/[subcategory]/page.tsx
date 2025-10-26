import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowLeft, Building2, MapPin, Clock, Star, Heart } from "lucide-react";
import Image from "next/image";
import { Unbounded } from 'next/font/google';
import styles from './page.module.css';

const unbounded = Unbounded({ subsets: ['cyrillic', 'latin'] });

type Params = { slug: string; cat: string; subcategory: string };

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, cat, subcategory } = await params;

  console.log('🔍 SUBCATEGORY PAGE: Loading subcategory page', {
    slug,
    cat,
    subcategory
  });

  // Получаем город
  const city = await prisma.city.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, isPublic: true }
  });

  if (!city || !city.isPublic) {
    console.log('🔍 SUBCATEGORY PAGE: City not found or not public');
    notFound();
  }

  // Получаем категорию
  const category = await prisma.venueCategory.findFirst({
    where: { 
      slug: cat,
      isActive: true
    },
    select: { id: true, name: true, slug: true, icon: true, color: true }
  });

  if (!category) {
    console.log('🔍 SUBCATEGORY PAGE: Category not found');
    notFound();
  }

  // Получаем подкатегорию
  const subcategoryData = await prisma.venueSubcategory.findFirst({
    where: { 
      slug: subcategory,
      isActive: true,
      categoryId: category.id
    },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
      backgroundImage: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });

  if (!subcategoryData) {
    console.log('🔍 SUBCATEGORY PAGE: Subcategory not found');
    notFound();
  }

  // Получаем места в этой подкатегории для данного города
  const venues = await prisma.venuePartner.findMany({
    where: {
      subcategoryId: subcategoryData.id,
      cityId: city.id,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      coverImage: true,
      metro: true,
      address: true,
      subcategory: {
        select: {
          name: true,
          slug: true
        }
      },
      city: {
        select: {
          name: true,
          slug: true
        }
      },
      vendor: {
        select: {
          displayName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('🔍 SUBCATEGORY PAGE: Found venues', venues.length);

  // Агрегация отзывов (рейтинг и количество) одним запросом
  const venueIds = venues.map(v => v.id)
  let reviewsByVenue = new Map<number, { avg: number; count: number }>()
  if (venueIds.length > 0) {
    const grouped = await prisma.venueReview.groupBy({
      by: ['venueId'],
      where: {
        venueId: { in: venueIds },
        status: 'APPROVED'
      },
      _avg: { rating: true },
      _count: { rating: true }
    })
    grouped.forEach(g => {
      reviewsByVenue.set(g.venueId, {
        avg: Number((g._avg.rating ?? 0).toFixed(1)),
        count: g._count.rating
      })
    })
  }

  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm mb-2">
                <Link 
                  href={`/city/${city.slug}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {city.name}
                </Link>
                <span className="text-gray-400">/</span>
                <Link 
                  href={`/city/${city.slug}/cat/venues`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Места
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{subcategoryData.name}</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">{subcategoryData.name}</h1>
              <p className="text-gray-600 mt-1">в {city.name}</p>
            </div>
            <Link
              href={`/city/${city.slug}/cat/venues`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад к категориям
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section - Анимированная волна с градиентом */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white rounded-3xl mb-12">
          {/* Анимированные частицы */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute top-20 right-20 w-6 h-6 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-32 right-1/3 w-5 h-5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="relative z-10 py-20">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                {/* Kiddeo рекомендует - левый верхний угол */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Kiddeo рекомендует
                </div>
                
                {/* Кнопка избранного - правый верхний угол */}
                <button className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
                  <Heart className="w-6 h-6 text-white" fill="none" stroke="currentColor" />
                </button>
                
                <div className="text-6xl mb-4">
                  {subcategoryData.icon && (
                    subcategoryData.icon.startsWith('http') || subcategoryData.icon.startsWith('/') ? (
                      <img
                        src={subcategoryData.icon}
                        alt={subcategoryData.name}
                        className="w-16 h-16 object-contain mx-auto"
                      />
                    ) : (
                      <span>{subcategoryData.icon}</span>
                    )
                  )}
                </div>
                <h1 className={`text-5xl sm:text-7xl font-bold mb-8 ${styles.animateFadeIn}`}>
                  {subcategoryData.name}
                </h1>
                
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  Откройте для себя лучшие места для детей в категории "{subcategoryData.name}"
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <input 
                    type="text" 
                    placeholder={`Поиск в ${subcategoryData.name.toLowerCase()}...`}
                    className="px-6 py-3 rounded-lg text-gray-900 w-full sm:w-96"
                  />
                  <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
                    Найти
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Анимированная волна */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg 
              className="w-full h-48 text-white transform rotate-180 scale-x-[1.3] origin-center" 
              viewBox="0 0 1200 180" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
                  <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
                </linearGradient>
                <linearGradient id="waveGradientWhite" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.8)' }} />
                  <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,1)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.8)' }} />
                </linearGradient>
              </defs>
              
              {/* Первая волна - полностью белая */}
              <path 
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                fill="white"
                className={styles.animateWave1}
              />
              
              {/* Вторая волна - полупрозрачная */}
              <path 
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24c13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                fill="url(#waveGradient)"
                opacity="0.7"
                className={styles.animateWave2}
              />
              
              {/* Третья волна - белая */}
              <path 
                d="M0,0V30.81C13,51.92,27.64,71.86,47.69,87.05,99.41,126.27,165,126,224.58,106.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24c13,51.92,27.64,71.86,47.69,87.05,99.41,126.27,165,126,224.58,106.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                fill="url(#waveGradientWhite)"
                opacity="0.6"
                className={styles.animateWave3}
              />
              
              {/* Четвертая волна - полупрозрачная */}
              <path 
                d="M0,0V60.81C13,81.92,27.64,101.86,47.69,117.05,99.41,156.27,165,156,224.58,136.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                fill="url(#waveGradient)"
                opacity="0.4"
                className={styles.animateWave1}
                style={{ animationDelay: '1s' }}
              />
            </svg>
          </div>

        </section>

        {/* Filters */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Фильтры</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любая</option>
                  <option>До 500 ₽</option>
                  <option>500-1000 ₽</option>
                  <option>От 1000 ₽</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Район</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любой</option>
                  <option>Центральный</option>
                  <option>Северный</option>
                  <option>Южный</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Возраст</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любой</option>
                  <option>0-3 года</option>
                  <option>3-6 лет</option>
                  <option>6+ лет</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Рейтинг</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любой</option>
                  <option>4.5+ звезд</option>
                  <option>4.0+ звезд</option>
                  <option>3.5+ звезд</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Results Header */}
        <section className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Найдено {venues.length} мест</h2>
              <p className="text-gray-600 mt-1">в категории "{subcategoryData.name}"</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Сортировка:</span>
              <select className="bg-white rounded-lg px-4 py-2 border">
                <option>По популярности</option>
                <option>По цене</option>
                <option>По рейтингу</option>
                <option>По расстоянию</option>
              </select>
            </div>
          </div>
        </section>

        {/* Venues Grid */}
        <section className="mb-8">
          {venues.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Пока нет мест в этой подкатегории
              </h3>
              <p className="text-gray-600">
                В подкатегории "{subcategoryData.name}" пока нет мест.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Link
                  key={venue.id}
                  href={`/city/${city.slug}/venue/${venue.slug}`}
                  className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-3xl">
                    {venue.coverImage ? (
                      <Image
                        src={venue.coverImage}
                        alt={venue.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white" />
                      </div>
                    )}

                    {/* Dynamic gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-2xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                        {subcategoryData.name}
                      </span>
                    </div>

                    {/* Rating badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-1 text-sm font-semibold text-gray-800 shadow-lg">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {(() => {
                          const stats = reviewsByVenue.get(venue.id)
                          return stats ? `${stats.avg} (${stats.count})` : '0.0 (0)'
                        })()}
                      </div>
                    </div>

                    {/* Hover overlay with action */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
                          <Heart className="w-6 h-6 text-gray-800" />
                        </div>
                      </div>
                    </div>

                    {/* Floating decorative elements */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

                    {/* Text content over image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors group-hover:scale-105 transform transition-transform duration-300">
                        {venue.name}
                      </h3>
                      
                      {/* Price and metro */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">
                          от 500 ₽
                        </span>
                        <div className="flex items-center text-white/80 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {venue.metro || 'Метро не указано'}
                        </div>
                      </div>

                      {/* Progress bar animation */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {venues.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  ← Предыдущая
                </button>
                <button className="px-3 py-2 bg-purple-500 text-white rounded-lg">1</button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Следующая →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Related Categories */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Похожие категории</h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🎠 Аттракционы
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🎭 Театры
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🎨 Мастер-классы
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🏃‍♂️ Спорт
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
