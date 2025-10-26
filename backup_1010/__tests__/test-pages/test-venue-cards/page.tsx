'use client'

import { Unbounded } from 'next/font/google'
import Link from 'next/link'
import { VenueImageCarousel } from '@/components/VenueImageCarousel'
import { MapPin, Star, Clock, Users, Heart, Building, Camera, Coffee } from 'lucide-react'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

// Тестовые данные для демонстрации карточек мест
const testVenues = [
  {
    id: 1,
    title: "Детская студия 'Ням-Ням'",
    slug: "detskaya-studiya-nyam-nyam",
    description: "Студия кулинарного мастерства для детей от 3 лет. Учим готовить простые и вкусные блюда, развиваем мелкую моторику и творческие способности.",
    address: "ул. Арбат, д. 15",
    priceFrom: 1500,
    priceTo: 2500,
    isFree: false,
    isIndoor: true,
    district: "Центральный",
    images: [
      "/uploads/upload_1759147935103.jpg",
      "/uploads/upload_1758137940884.jpg",
      "/uploads/upload_1758123498051.png"
    ],
    vendor: {
      id: 1,
      displayName: "Студия 'Ням-Ням'",
      logo: "/uploads/upload_1759147935103.jpg"
    },
    category: {
      id: 1,
      name: "Мастер-классы",
      slug: "master-klassy"
    },
    _count: {
      reviews: 23,
      bookings: 45
    }
  },
  {
    id: 2,
    title: "Парк развлечений 'Сказка'",
    slug: "park-razvlecheniy-skazka",
    description: "Большой парк развлечений с аттракционами, игровыми площадками и зонами отдыха для всей семьи.",
    address: "пр-т Мира, д. 100",
    priceFrom: 500,
    priceTo: 1500,
    isFree: false,
    isIndoor: false,
    district: "Северный",
    images: [
      "/uploads/upload_1758137940884.jpg",
      "/uploads/upload_1758123498051.png"
    ],
    vendor: {
      id: 2,
      displayName: "Парк 'Сказка'",
      logo: "/uploads/upload_1758137940884.jpg"
    },
    category: {
      id: 2,
      name: "Парки",
      slug: "parki"
    },
    _count: {
      reviews: 67,
      bookings: 123
    }
  },
  {
    id: 3,
    title: "Музей 'Детский мир'",
    slug: "muzey-detskiy-mir",
    description: "Интерактивный музей для детей с экспозициями о природе, науке и истории. Все можно трогать и изучать!",
    address: "Красная пл., д. 1",
    priceFrom: 0,
    priceTo: 0,
    isFree: true,
    isIndoor: true,
    district: "Центральный",
    images: [
      "/uploads/upload_1758123498051.png"
    ],
    vendor: {
      id: 3,
      displayName: "Музей 'Детский мир'",
      logo: "/uploads/upload_1758123498051.png"
    },
    category: {
      id: 3,
      name: "Музеи",
      slug: "muzei"
    },
    _count: {
      reviews: 89,
      bookings: 234
    }
  }
];

// Компонент карточки места из VenueCategoryPage
function VenueCard({ 
  venue, 
  citySlug, 
  formatPrice 
}: { 
  venue: any; 
  citySlug: string;
  formatPrice: (venue: any) => string;
}) {
  return (
    <Link
      href={`/city/${citySlug}/venue/${venue.slug}`}
      className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-violet-300"
    >
      <div className="flex h-80">
        {/* Левая часть - изображение с каруселью */}
        <div className="w-[32rem] h-80 flex-shrink-0 relative overflow-hidden">
          <VenueImageCarousel venueId={venue.id} images={venue.images} />
          
          {/* Бейдж */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded">
              {venue.id % 2 === 0 ? 'Подарок' : 'Новинка'}
            </span>
          </div>
        </div>

        {/* Правая часть - информация */}
        <div className="flex-1 px-6 pb-6 pt-0 flex flex-col justify-between">
          {/* Название места с кнопкой избранного */}
          <div className="flex items-center justify-between mb-3 h-20">
            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-violet-600 transition-colors flex-1">
              {venue.title}
            </h3>
            <button className="text-slate-400 hover:text-red-500 transition-colors ml-4 flex-shrink-0">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Рейтинг и отзывы */}
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center text-red-500">
              <Star className="w-4 h-4 fill-current mr-1" />
              <span className="font-medium">4.{(venue.id % 3) + 5}</span>
            </div>
            <span className="text-slate-400">•</span>
            <span>{venue._count.reviews} оценок</span>
          </div>

          {/* Описание */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {venue.description}
          </p>

          {/* Адрес и район */}
          <div className="flex items-center text-sm text-slate-500 mb-4">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{venue.address}</span>
            {venue.district && (
              <>
                <span className="text-slate-300 mx-2">•</span>
                <span className="text-slate-400">{venue.district}</span>
              </>
            )}
          </div>

          {/* Цена и категория */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-900">
              {formatPrice(venue)}
            </div>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
              {venue.category.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Компонент карточки места из VenuesClient (стандартный вид)
function StandardVenueCard({ venue, citySlug, formatPrice }: { venue: any; citySlug: string; formatPrice: (venue: any) => string }) {
  return (
    <Link
      href={`/city/${citySlug}/venue/${venue.slug}`}
      className="group bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Изображение */}
      <div className="relative h-48 w-full overflow-hidden">
        <VenueImageCarousel venueId={venue.id} images={venue.images} />
        
        {/* Бейдж */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded">
            {venue.isFree ? 'Бесплатно' : 'Платно'}
          </span>
        </div>
        
        {/* Кнопка избранного */}
        <button className="absolute top-3 right-3 text-white/80 hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-violet-600 transition-colors mb-2">
          {venue.title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
          {venue.description}
        </p>

        {/* Рейтинг и отзывы */}
        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
          <div className="flex items-center text-red-500">
            <Star className="w-4 h-4 fill-current mr-1" />
            <span className="font-medium">4.{(venue.id % 3) + 5}</span>
          </div>
          <span className="text-slate-400">•</span>
          <span>{venue._count.reviews} отзывов</span>
        </div>

        {/* Адрес */}
        <div className="flex items-center text-sm text-slate-500 mb-3">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{venue.address}</span>
        </div>

        {/* Цена и категория */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-900">
            {formatPrice(venue)}
          </div>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
            {venue.category.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Компонент карточки места из VenuesClient (премиум вид)
function PremiumVenueCard({ venue, citySlug, formatPrice }: { venue: any; citySlug: string; formatPrice: (venue: any) => string }) {
  return (
    <Link
      href={`/city/${citySlug}/venue/${venue.slug}`}
      className="group bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Изображение с градиентом */}
      <div className="relative h-56 w-full overflow-hidden">
        <VenueImageCarousel venueId={venue.id} images={venue.images} />
        
        {/* Градиентный оверлей */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Бейдж */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-violet-600 text-white text-sm font-medium rounded-full shadow-lg">
            {venue.isFree ? 'Бесплатно' : 'Платно'}
          </span>
        </div>
        
        {/* Кнопка избранного */}
        <button className="absolute top-4 right-4 text-white/80 hover:text-red-500 transition-colors bg-black/20 rounded-full p-2">
          <Heart className="w-5 h-5" />
        </button>

        {/* Рейтинг */}
        <div className="absolute bottom-4 left-4 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="w-4 h-4 fill-current text-red-500 mr-1" />
          <span className="font-medium text-slate-900">4.{(venue.id % 3) + 5}</span>
        </div>
      </div>

      {/* Контент */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors mb-2">
          {venue.title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {venue.description}
        </p>

        {/* Адрес */}
        <div className="flex items-center text-sm text-slate-500 mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{venue.address}</span>
        </div>

        {/* Цена и категория */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-slate-900">
            {formatPrice(venue)}
          </div>
          <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">
            {venue.category.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Компонент карточки места из главной страницы
function HomeVenueCard({ venue, citySlug }: { venue: any; citySlug: string }) {
  return (
    <Link
      href={`/city/${citySlug}/venue/${venue.slug}`}
      className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="h-48 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
        <VenueImageCarousel venueId={venue.id} images={venue.images} />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/80 to-blue-500/80" />
        <div className="text-center text-white relative z-10">
          <div className="text-4xl mb-2">🏰</div>
          <div className="text-lg font-semibold">{venue.title}</div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{venue.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{venue.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1" />
          {venue.address}
        </div>
      </div>
    </Link>
  );
}

export default function TestVenueCardsPage() {
  const citySlug = "moskva";
  
  const formatPrice = (venue: any) => {
    if (venue.isFree) return "Бесплатно";
    if (venue.priceFrom && venue.priceTo) {
      return `${venue.priceFrom.toLocaleString('ru-RU')} - ${venue.priceTo.toLocaleString('ru-RU')} ₽`;
    }
    if (venue.priceFrom) {
      return `от ${venue.priceFrom.toLocaleString('ru-RU')} ₽`;
    }
    return "Цена по запросу";
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${unbounded.className}`}>
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Тест дизайнов карточек мест</h1>
          <p className="mt-2 text-lg text-gray-600">Демонстрация различных компонентов карточек мест</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">

        {/* 1. Карточка места из VenueCategoryPage (горизонтальная) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Карточка места из VenueCategoryPage (горизонтальная)</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <VenueCard venue={testVenues[0]} citySlug={citySlug} formatPrice={formatPrice} />
          </div>
        </section>

        {/* 2. Стандартная карточка места из VenuesClient */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Стандартная карточка места из VenuesClient</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testVenues.map(venue => (
                <StandardVenueCard key={venue.id} venue={venue} citySlug={citySlug} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        </section>

        {/* 3. Премиум карточка места из VenuesClient */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Премиум карточка места из VenuesClient</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testVenues.map(venue => (
                <PremiumVenueCard key={venue.id} venue={venue} citySlug={citySlug} formatPrice={formatPrice} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Карточка места с главной страницы */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Карточка места с главной страницы</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testVenues.map(venue => (
                <HomeVenueCard key={venue.id} venue={venue} citySlug={citySlug} />
              ))}
            </div>
          </div>
        </section>

        {/* 5. Сравнение всех дизайнов */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Сравнение всех дизайнов</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-8">
              {/* Горизонтальная карточка */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Горизонтальная карточка (VenueCategoryPage)</h3>
                <VenueCard venue={testVenues[0]} citySlug={citySlug} formatPrice={formatPrice} />
              </div>

              {/* Стандартная карточка */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Стандартная карточка (VenuesClient)</h3>
                <div className="max-w-sm">
                  <StandardVenueCard venue={testVenues[0]} citySlug={citySlug} formatPrice={formatPrice} />
                </div>
              </div>

              {/* Премиум карточка */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Премиум карточка (VenuesClient)</h3>
                <div className="max-w-sm">
                  <PremiumVenueCard venue={testVenues[0]} citySlug={citySlug} formatPrice={formatPrice} />
                </div>
              </div>

              {/* Карточка с главной */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Карточка с главной страницы</h3>
                <div className="max-w-sm">
                  <HomeVenueCard venue={testVenues[0]} citySlug={citySlug} />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
