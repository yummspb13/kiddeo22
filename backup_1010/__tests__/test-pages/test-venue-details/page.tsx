'use client'

import { Unbounded } from 'next/font/google'
import Gallery from '@/components/Gallery'
import { VenueImageCarousel } from '@/components/VenueImageCarousel'
import { MapPin, Star, Clock, Users, Heart, Building, Camera, Coffee, Phone, Mail, Globe, Calendar } from 'lucide-react'
import Image from 'next/image'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

// Тестовые данные для демонстрации внутренних дизайнов мест
const testVenue = {
  id: 1,
  title: "Детская студия 'Ням-Ням'",
  slug: "detskaya-studiya-nyam-nyam",
  description: "Студия кулинарного мастерства для детей от 3 лет. Учим готовить простые и вкусные блюда, развиваем мелкую моторику и творческие способности. Наши занятия проходят в уютной атмосфере с опытными преподавателями.",
  fullDescription: "Добро пожаловать в детскую студию кулинарного мастерства 'Ням-Ням'! Мы создали уникальное пространство, где дети могут не только научиться готовить, но и развить свои творческие способности, мелкую моторику и вкусовые предпочтения.\n\nНаши занятия проходят в небольших группах до 8 человек, что позволяет уделить внимание каждому ребенку. Мы используем только свежие и качественные продукты, а также безопасное оборудование, адаптированное для детей.\n\nПрограмма включает в себя:\n• Базовые кулинарные навыки\n• Работу с различными продуктами\n• Развитие творческого мышления\n• Командную работу\n• Изучение основ здорового питания",
  address: "ул. Арбат, д. 15, Москва",
  priceFrom: 1500,
  priceTo: 2500,
  isFree: false,
  isIndoor: true,
  district: "Центральный",
  images: [
    "/uploads/upload_1759147935103.jpg",
    "/uploads/upload_1758137940884.jpg",
    "/uploads/upload_1758123498051.png",
    "/uploads/upload_1758116344713.jpg"
  ],
  vendor: {
    id: 1,
    displayName: "Студия 'Ням-Ням'",
    description: "Профессиональная студия кулинарного мастерства для детей",
    logo: "/uploads/upload_1759147935103.jpg",
    website: "https://nyam-nyam.ru",
    phone: "+7 (495) 123-45-67",
    email: "info@nyam-nyam.ru",
    address: "ул. Арбат, д. 15, Москва"
  },
  category: {
    id: 1,
    name: "Мастер-классы",
    slug: "master-klassy"
  },
  _count: {
    reviews: 23,
    bookings: 45
  },
  reviews: [
    {
      id: 1,
      rating: 5,
      title: "Отличная студия!",
      content: "Мой ребенок в восторге от занятий. Преподаватели очень внимательные и терпеливые.",
      createdAt: new Date("2024-01-15"),
      user: {
        id: 1,
        name: "Анна Петрова",
        image: "/uploads/avatars/c30b1693-1eb8-4bb2-aea3-ba332b8976a7.gif"
      }
    },
    {
      id: 2,
      rating: 4,
      title: "Хорошо, но дорого",
      content: "Качество занятий хорошее, но цены немного завышены. Ребенку нравится.",
      createdAt: new Date("2024-01-10"),
      user: {
        id: 2,
        name: "Мария Иванова",
        image: "/uploads/avatars/ee2ebe97-c43c-41d9-96d0-d3c7d3c259b3.gif"
      }
    }
  ],
  coordinates: {
    lat: 55.751244,
    lng: 37.618423
  }
};

// Компонент простой детальной страницы места
function SimpleVenueDetails({ venue }: { venue: any }) {
  const averageRating = venue.reviews.length > 0
    ? (venue.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / venue.reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Заголовок места */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start space-x-6">
            {venue.images[0] && (
              <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={venue.images[0]}
                  alt={venue.title}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{venue.title}</h1>
              {venue.category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                  {venue.category.name}
                </span>
              )}
              
              {/* Рейтинг и отзывы */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center text-red-500">
                  <Star className="w-5 h-5 fill-current mr-1" />
                  <span className="font-medium">{averageRating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>{venue._count.reviews} отзывов</span>
              </div>

              {/* Адрес */}
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{venue.address}</span>
              </div>

              {/* Цена */}
              <div className="text-2xl font-bold text-gray-900">
                {venue.isFree ? 'Бесплатно' : `от ${venue.priceFrom?.toLocaleString('ru-RU')} ₽`}
              </div>
            </div>
          </div>
        </div>

        {/* Описание */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">О месте</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {venue.fullDescription}
          </p>
        </div>

        {/* Отзывы */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Отзывы ({venue._count.reviews})</h2>
          <div className="space-y-6">
            {venue.reviews.map((review: any) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  {review.user.image ? (
                    <img
                      src={review.user.image}
                      alt={review.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {review.createdAt.toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент расширенной детальной страницы места с галереей
function EnhancedVenueDetails({ venue }: { venue: any }) {
  const averageRating = venue.reviews.length > 0
    ? (venue.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / venue.reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хлебные крошки */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <a href="/" className="text-gray-400 hover:text-gray-500">Главная</a>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <a href="/city/moskva/cat/venues" className="text-gray-400 hover:text-gray-500">Места</a>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">{venue.title}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-8">
            {/* Галерея */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <Gallery images={venue.images} />
            </div>

            {/* Информация о месте */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">
                      {venue.category.name}
                    </span>
                    <div className="flex items-center text-red-500">
                      <Star className="w-5 h-5 fill-current mr-1" />
                      <span className="font-medium">{averageRating}</span>
                      <span className="text-gray-500 ml-2">({venue._count.reviews} отзывов)</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="w-6 h-6" />
                </button>
              </div>

              {/* Описание */}
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">О месте</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {venue.fullDescription}
                </p>
              </div>
            </div>

            {/* Отзывы */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Отзывы ({venue._count.reviews})</h2>
              <div className="space-y-6">
                {venue.reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      {review.user.image ? (
                        <img
                          src={review.user.image}
                          alt={review.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                          <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {review.createdAt.toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Информация и контакты */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация</h3>
              
              {/* Цена */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {venue.isFree ? 'Бесплатно' : `от ${venue.priceFrom?.toLocaleString('ru-RU')} ₽`}
                </div>
                {venue.priceTo && (
                  <div className="text-sm text-gray-500">
                    до {venue.priceTo.toLocaleString('ru-RU')} ₽
                  </div>
                )}
              </div>

              {/* Адрес */}
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Адрес</div>
                    <div className="text-gray-600">{venue.address}</div>
                  </div>
                </div>
              </div>

              {/* Контакты */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${venue.vendor.phone}`} className="text-gray-600 hover:text-violet-600">
                    {venue.vendor.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${venue.vendor.email}`} className="text-gray-600 hover:text-violet-600">
                    {venue.vendor.email}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a href={venue.vendor.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-violet-600">
                    Сайт
                  </a>
                </div>
              </div>

              {/* Кнопка записи */}
              <button className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-violet-700 transition-colors">
                Записаться
              </button>
            </div>

            {/* Карта */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Расположение</h3>
              </div>
              <div className="h-64">
                <iframe
                  src={`https://yandex.ru/map-widget/v1/?ll=${venue.coordinates.lng}%2C${venue.coordinates.lat}&z=16&l=map&pt=${venue.coordinates.lng}%2C${venue.coordinates.lat}%2Cpm2rdm`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  title="Карта"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestVenueDetailsPage() {
  return (
    <div className={`min-h-screen bg-gray-100 ${unbounded.className}`}>
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Тест дизайнов внутренних страниц мест</h1>
          <p className="mt-2 text-lg text-gray-600">Демонстрация различных дизайнов детальных страниц мест</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">

        {/* 1. Простая детальная страница места */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Простая детальная страница места</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <SimpleVenueDetails venue={testVenue} />
          </div>
        </section>

        {/* 2. Расширенная детальная страница места с галереей */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Расширенная детальная страница места с галереей</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <EnhancedVenueDetails venue={testVenue} />
          </div>
        </section>

        {/* 3. Сравнение дизайнов */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Сравнение дизайнов</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Простой дизайн</h3>
                <div className="text-sm text-gray-600 mb-4">
                  • Классическая компоновка<br/>
                  • Изображение слева, информация справа<br/>
                  • Простые блоки с описанием и отзывами<br/>
                  • Минималистичный стиль
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Используется в:</strong> /city/[slug]/venue/[venueSlug]
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Расширенный дизайн</h3>
                <div className="text-sm text-gray-600 mb-4">
                  • Современная компоновка с галереей<br/>
                  • Боковая панель с информацией<br/>
                  • Интерактивная карта<br/>
                  • Улучшенная типографика
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Используется в:</strong> /listing/[slug] (адаптированный)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
