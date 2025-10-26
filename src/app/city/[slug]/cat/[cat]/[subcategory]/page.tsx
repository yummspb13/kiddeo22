import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ArrowLeft, Building2, MapPin, Clock, Star, Heart } from "lucide-react";
import Image from "next/image";
import { Unbounded } from 'next/font/google';
import styles from './page.module.css';
import ViewCounter from '@/components/ViewCounter';
import VenueViewCounter from '@/components/VenueViewCounter';
import SubcategoryFilters from '@/components/SubcategoryFilters';
import SubcategoryPagination from '@/components/SubcategoryPagination';
import SubcategorySorting from '@/components/SubcategorySorting';
import VenueListOrMap from '@/components/VenueListOrMap';
import VenueMapView from '@/components/VenueMapView';
import SubcategorySearchBox from '@/components/SubcategorySearchBox';
import { getPriceDisplay } from '@/utils/priceDisplay';

const unbounded = Unbounded({ subsets: ['cyrillic', 'latin'] });

type Params = { slug: string; cat: string; subcategory: string };

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug, cat, subcategory } = await params;
  const filters = await searchParams;

  console.log('🔍 SUBCATEGORY PAGE: Loading subcategory page', {
    slug,
    cat,
    subcategory
  });

  // Получаем все данные параллельно
  const [city, subcategoryData] = await Promise.all([
    prisma.city.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, isPublic: true }
    }),
    prisma.venueSubcategory.findFirst({
      where: { 
        slug: subcategory,
        isActive: true,
        category: {
          slug: cat,
          isActive: true
        }
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
            slug: true,
            icon: true,
            color: true
          }
        }
      }
    })
  ]);

  if (!city || !city.isPublic) {
    console.log('🔍 SUBCATEGORY PAGE: City not found or not public');
    notFound();
  }

  if (!subcategoryData) {
    console.log('🔍 SUBCATEGORY PAGE: Subcategory not found');
    notFound();
  }

  const category = subcategoryData.category;

  // Обрабатываем параметры фильтрации
  const filterParams = {
    price: filters.price as string || '',
    district: filters.district as string || '',
    age: filters.age as string || '',
    rating: filters.rating as string || '',
    sort: filters.sort as string || 'popularity',
    page: parseInt(filters.page as string || '1')
  };

  console.log('🔍 SUBCATEGORY PAGE: Filter params', filterParams);

  // Строим условия для фильтрации
  const whereConditions: any = {
    subcategoryId: subcategoryData.id,
    cityId: city.id,
    status: 'ACTIVE'
  };

  // Фильтр по цене
  if (filterParams.price) {
    if (filterParams.price === '0-500') {
      whereConditions.priceFrom = { lte: 500 };
    } else if (filterParams.price === '500-1000') {
      whereConditions.priceFrom = { gte: 500, lte: 1000 };
    } else if (filterParams.price === '1000-2000') {
      whereConditions.priceFrom = { gte: 1000, lte: 2000 };
    } else if (filterParams.price === '2000+') {
      whereConditions.priceFrom = { gte: 2000 };
    }
  }

  // Фильтр по возрасту
  if (filterParams.age) {
    if (filterParams.age === '0-3') {
      whereConditions.ageFrom = { lte: 3 };
    } else if (filterParams.age === '3-6') {
      whereConditions.ageFrom = { gte: 3, lte: 6 };
    } else if (filterParams.age === '6-12') {
      whereConditions.ageFrom = { gte: 3, lte: 12 };
    } else if (filterParams.age === '12+') {
      whereConditions.ageFrom = { gte: 12 };
    }
  }

  // Фильтр по рейтингу
  if (filterParams.rating) {
    const minRating = parseFloat(filterParams.rating);
    whereConditions.rating = { gte: minRating };
  }

  // Строим условия сортировки
  let orderBy: any = { createdAt: 'desc' };
  
  switch (filterParams.sort) {
    case 'price-asc':
      orderBy = { priceFrom: 'asc' };
      break;
    case 'price-desc':
      orderBy = { priceFrom: 'desc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'popularity':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // Получаем данные параллельно
  const itemsPerPage = 6;
  const skip = (filterParams.page - 1) * itemsPerPage;

  console.log('🔍 SUBCATEGORY PAGE: Where conditions', whereConditions);
  console.log('🔍 SUBCATEGORY PAGE: Order by', orderBy);
  console.log('🔍 SUBCATEGORY PAGE: Pagination', { skip, take: itemsPerPage });

  const [totalVenues, venues] = await Promise.all([
    prisma.venuePartner.count({
      where: whereConditions
    }),
    prisma.venuePartner.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        metro: true,
        address: true,
        priceFrom: true,
        priceTo: true,
        ageFrom: true,
        tariff: true,
        lat: true,
        lng: true,
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
      orderBy,
      skip,
      take: itemsPerPage
    })
  ]);

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
        avg: g._avg.rating ? parseFloat(g._avg.rating.toFixed(1)) : 0,
        count: g._count.rating
      })
    })
  }

  // Получаем случайные места города для блока "Похожие места"
  const randomVenues = await prisma.venuePartner.findMany({
    where: {
      cityId: city.id,
      status: 'ACTIVE',
      id: { notIn: venues.map(v => v.id) } // Исключаем уже показанные места
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      coverImage: true,
      metro: true,
      address: true,
      priceFrom: true,
      priceTo: true,
      ageFrom: true,
      tariff: true,
      lat: true,
      lng: true,
      subcategory: {
        select: {
          name: true,
          slug: true,
          category: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      },
      vendor: {
        select: {
          displayName: true,
          logo: true
        }
      }
    },
    take: 6,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Навигационные хлебные крошки */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-3 text-sm">
                <Link 
                  href={`/city/${city.slug}/cat/venues`}
                className="text-gray-500 hover:text-violet-600 transition-all duration-300 font-unbounded font-medium hover:scale-105"
                >
                  Места
                </Link>
              <span className="text-gray-400 font-unbounded">/</span>
              <Link 
                href={`/city/${city.slug}/cat/venues?category=${subcategoryData.category.slug}`} 
                className="text-gray-500 hover:text-violet-600 transition-all duration-300 font-unbounded font-medium hover:scale-105"
              >
                {subcategoryData.category.name}
              </Link>
              <span className="text-gray-400 font-unbounded">/</span>
              <span className="text-gray-500 font-unbounded font-medium">
                {subcategoryData.name}
              </span>
              </nav>
            <Link
              href={`/city/${city.slug}/cat/venues`}
              className="group flex items-center text-violet-600 hover:text-violet-700 font-unbounded font-bold transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">←</span>
              <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent group-hover:from-violet-700 group-hover:to-pink-700 transition-all duration-300">
              Назад к категориям
              </span>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section - Анимированная волна с градиентом */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white rounded-3xl mb-12">
          {/* Фон с фотографией подкатегории */}
          {subcategoryData.backgroundImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
              style={{
                backgroundImage: `url(${subcategoryData.backgroundImage})`
              }}
            ></div>
          )}
          
          {/* Дополнительное тонирование */}
          <div className="absolute inset-0 bg-black/30"></div>
          
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
                
                <div className="flex justify-center">
                  <SubcategorySearchBox 
                    subcategoryName={subcategoryData.name}
                    subcategorySlug={subcategoryData.slug}
                    citySlug={city.slug}
                  />
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
          <SubcategoryFilters />
        </section>

        {/* Results Header */}
        <section className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Найдено {totalVenues} мест</h2>
              <p className="text-gray-600 mt-1">в категории "{subcategoryData.name}"</p>
            </div>
            <SubcategorySorting />
          </div>
        </section>

        {/* Venues Grid or Map */}
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
            <VenueListOrMap
              mapComponent={
                <VenueMapView
                  venues={venues as any}
                  cityCenter={{ 
                    lat: city.slug === 'moskva' ? 55.7558 : 59.9311, 
                    lng: city.slug === 'moskva' ? 37.6176 : 30.3609 
                  } as any}
                  cityName={city.name}
                  citySlug={city.slug}
                />
              }
            >
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
                          alt={venue.name || 'Venue'}
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

                      {/* Badge with view count */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-2xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                          {subcategoryData.name}
                        </span>
                        <div className="w-fit">
                          <ViewCounter venueId={venue.id} />
                          <VenueViewCounter venueId={venue.id} />
                        </div>
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
                            {(() => {
                              const priceInfo = getPriceDisplay({
                                tariff: venue.tariff as any,
                                priceFrom: venue.priceFrom,
                                priceTo: venue.priceTo,
                                isFree: false
                              } as any);
                              return priceInfo.mainText;
                            })()}
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
            </VenueListOrMap>
          )}
        </section>

        {/* Pagination */}
        {totalVenues > 0 && (
          <SubcategoryPagination 
            totalItems={totalVenues} 
            itemsPerPage={6}
            currentPage={filterParams.page}
          />
        )}

        {/* Похожие места */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Похожие места</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {randomVenues.map((venue) => (
                <Link
                  key={venue.id}
                  href={`/city/${city.slug}/venue/${venue.slug}`}
                  className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-3xl">
                    {venue.coverImage ? (
                      <Image
                        src={venue.coverImage}
                        alt={venue.name || 'Venue'}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

                    {/* Price badge */}
                    <div className="absolute left-2" style={{ top: '7px' }}>
                      <span className="inline-flex items-center px-2 py-1 rounded-xl text-[10px] font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg font-unbounded">
                        {venue.tariff === 'FREE' ? 'БЕСПЛАТНО' : (venue.priceFrom ? `от ${venue.priceFrom}₽` : 'Цена по запросу')}
                      </span>
                    </div>

                    {/* Rating badge */}
                    <div className="absolute right-2 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 text-[10px] font-semibold text-gray-800 shadow-lg" style={{ top: '7px' }}>
                      <div className="flex items-center gap-1 font-unbounded">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {venue.id % 3 + 4}.{venue.id % 10}
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
                          <Heart className="w-6 h-6 text-gray-800" />
                        </div>
                      </div>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors group-hover:scale-105 transform transition-transform duration-300">
                        {venue.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">
                          {(() => {
                            const priceInfo = getPriceDisplay({
                              tariff: venue.tariff as any,
                              priceFrom: venue.priceFrom,
                              priceTo: venue.priceTo,
                              isFree: false
                            } as any);
                            return priceInfo.mainText;
                          })()}
                        </span>
                        <div className="flex items-center text-white/80 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {venue.metro || 'Метро не указано'}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar animation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
