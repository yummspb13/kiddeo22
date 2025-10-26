'use client'

import { Unbounded } from 'next/font/google'
import AfishaEventCard from '@/components/AfishaEventCard'
import EventCard from '@/components/EventCard'
import EnhancedEventCard from '@/components/EnhancedEventCard'
import { default as CatalogEventCard } from '@/components/catalog/EventCard'
// import EventCardWithCart from '@/components/EventCardWithCart'
import EventCardSkeleton from '@/components/catalog/EventCardSkeleton'
import EventsGrid from '@/components/EventsGrid'
import EventsMap from '@/components/EventsMap'
import EventsDisplay from '@/components/EventsDisplay'
import EventsPageWrapper from '@/components/EventsPageWrapper'
import InteractiveCategories from '@/components/InteractiveCategories'
import CategoryFilter from '@/components/CategoryFilter'
import AgeFilter from '@/components/AgeFilter'
import PriceFilter from '@/components/PriceFilter'
import EventsViewToggleOnly from '@/components/EventsViewToggleOnly'
import NoEventsMessage from '@/components/NoEventsMessage'
import { EventsViewProvider } from '@/contexts/EventsViewContext'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

// Тестовые данные для демонстрации
const testEvents = [
  {
    id: 1,
    title: "Изумрудный город",
    slug: "izumrudnyy-gorod",
    description: "Волшебное театральное представление для всей семьи",
    venue: "Малый Кисловский переулок, 8",
    organizer: "Театр кукол им. С.В. Образцова",
    startDate: "2025-04-04T16:00:00.000Z",
    endDate: "2025-04-04T20:00:00.000Z",
    coordinates: "55.7558,37.6176",
    order: 1,
    status: "active",
    coverImage: "/uploads/upload_1759147935103.jpg",
    gallery: '["/uploads/gallery1.jpg", "/uploads/gallery2.jpg"]',
    tickets: '[{"price": 500, "name": "Детский билет"}, {"price": 800, "name": "Взрослый билет"}]',
    city: "Москва",
    category: "Театры",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ageFrom: 4,
    ageGroups: '["4-7", "8-12"]',
    viewCount: 156,
    isPopular: true,
    isPaid: true,
    isPromoted: false,
    priority: 1
  },
  {
    id: 2,
    title: "Мастер-класс по рисованию",
    slug: "master-klass-po-risovaniyu",
    description: "Учимся рисовать акварелью с профессиональным художником",
    venue: "Центр творчества 'Палитра'",
    organizer: "Студия 'Краски'",
    startDate: "2025-04-05T10:00:00.000Z",
    endDate: "2025-04-05T12:00:00.000Z",
    coordinates: "55.7558,37.6176",
    order: 2,
    status: "active",
    coverImage: null,
    gallery: '["/uploads/art1.jpg", "/uploads/art2.jpg"]',
    tickets: '[{"price": 0, "name": "Бесплатно"}]',
    city: "Москва",
    category: "Мастер-классы",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ageFrom: 6,
    ageGroups: '["8-12", "13-16"]',
    viewCount: 89,
    isPopular: false,
    isPaid: false,
    isPromoted: true,
    priority: 2
  },
  {
    id: 3,
    title: "Спортивные соревнования",
    slug: "sportivnye-sorevnovaniya",
    description: "Ежегодные соревнования по футболу среди детских команд",
    venue: "Стадион 'Динамо'",
    organizer: "Спортивный клуб 'Чемпион'",
    startDate: "2025-04-06T14:00:00.000Z",
    endDate: "2025-04-06T18:00:00.000Z",
    coordinates: "55.7558,37.6176",
    order: 3,
    status: "active",
    coverImage: "/uploads/sports.jpg",
    gallery: null,
    tickets: '[{"price": 200, "name": "Входной билет"}]',
    city: "Москва",
    category: "Спорт",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ageFrom: 8,
    ageGroups: '["8-12", "13-16"]',
    viewCount: 234,
    isPopular: true,
    isPaid: true,
    isPromoted: false,
    priority: 3
  }
]

const testCategories = [
  { name: "Театры", slug: "teatry", count: 15 },
  { name: "Мастер-классы", slug: "master-klassy", count: 8 },
  { name: "Спорт", slug: "sport", count: 12 },
  { name: "Музыка", slug: "muzyka", count: 6 },
  { name: "Образование", slug: "obrazovanie", count: 10 }
]

const categoryStats = [
  { category: "Театры", count: 15 },
  { category: "Мастер-классы", count: 8 },
  { category: "Спорт", count: 12 },
  { category: "Музыка", count: 6 },
  { category: "Образование", count: 10 }
]

const ageStats = [
  { label: "0-3 года", count: 5 },
  { label: "4-7 лет", count: 12 },
  { label: "8-12 лет", count: 18 },
  { label: "13+ лет", count: 8 }
]

const priceStats = [
  { label: "Бесплатно", count: 8 },
  { label: "До 500 ₽", count: 15 },
  { label: "500-1000 ₽", count: 12 },
  { label: "1000+ ₽", count: 6 }
]

// Тестовые данные для EventCard
const testListing = {
  id: 1,
  slug: "test-listing",
  title: "Тестовое мероприятие",
  description: "Описание тестового мероприятия",
  tickets: [
    { id: 1, name: "Детский билет", price: 500 },
    { id: 2, name: "Взрослый билет", price: 800 }
  ],
  slots: [
    { id: 1, start: "2025-04-04T16:00:00.000Z", end: "2025-04-04T20:00:00.000Z" }
  ],
  vendor: {
    displayName: "Тестовый организатор",
    type: "PRO" as const,
    kycStatus: "APPROVED" as const,
    payoutEnabled: true,
    officialPartner: true,
    subscriptionStatus: "ACTIVE" as const
  },
  address: "г. Москва, ул. Тестовая, 1",
  claimable: false,
  claimStatus: "PENDING" as const
}

// Тестовые данные для EnhancedEventCard
const testEvent = {
  id: 1,
  slug: "test-event",
  title: "Улучшенное тестовое событие",
  description: "Описание улучшенного тестового события",
  images: ["/uploads/test-event.jpg"],
  tickets: [
    { id: 1, name: "Детский билет", price: 500, description: "Для детей до 12 лет" },
    { id: 2, name: "Взрослый билет", price: 800, description: "Для взрослых" }
  ],
  slots: [
    { id: 1, start: "2025-04-04T16:00:00.000Z", end: "2025-04-04T20:00:00.000Z" }
  ],
  vendor: { displayName: "Тестовый организатор" },
  address: "г. Москва, ул. Тестовая, 1",
  coordinates: { lat: 55.7558, lng: 37.6176 },
  category: "Театры",
  ageRange: { min: 4, max: 12 },
  rating: 4.5,
  reviewsCount: 23,
  viewCount: 156
}

// Тестовые данные для EventCardWithCart
const testEventWithCart = {
  id: "1",
  title: "Событие с корзиной",
  description: "Описание события с корзиной",
  startDate: "2025-04-04T16:00:00.000Z",
  endDate: "2025-04-04T20:00:00.000Z",
  venue: "Тестовое место",
  organizer: "Тестовый организатор",
  price: 1500,
  image: "/uploads/test-event.jpg",
  category: "Театры",
  ageFrom: 6,
  ageGroups: "6-12 лет",
  coordinates: "55.7558,37.6176",
  viewCount: 89,
  slug: "test-event-with-cart"
}

export default function TestEventCardsPage() {
  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Тест дизайнов карточек событий</h1>
          <p className="text-gray-600 mt-2">Демонстрация всех вариантов отображения событий в афише</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 1. Различные дизайны карточек событий */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Различные дизайны карточек событий</h2>
          
          {/* AfishaEventCard */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">AfishaEventCard (основная карточка афиши)</h3>
            <div className="max-w-sm">
              <AfishaEventCard event={testEvents[0]} />
            </div>
          </div>

          {/* EventCard */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">EventCard (базовая карточка)</h3>
            <div className="max-w-sm">
              <EventCard listing={testListing} />
            </div>
          </div>

          {/* EnhancedEventCard */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">EnhancedEventCard (улучшенная карточка)</h3>
            <div className="max-w-sm">
              <EnhancedEventCard event={testEvent} />
            </div>
          </div>

          {/* CatalogEventCard */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">CatalogEventCard (карточка каталога)</h3>
            <div className="max-w-sm">
              <CatalogEventCard 
                id={1}
                title="Тестовое событие"
                description="Описание тестового события"
                price={1500}
                date={new Date()}
                time="18:00"
                address="г. Москва, ул. Тестовая, 1"
                district="Центральный"
                ageFrom={6}
                ageTo={12}
                isIndoor={true}
                rating={4.5}
                reviewsCount={23}
                isFavorite={false}
                onToggleFavorite={() => {}}
                onAddToCart={() => {}}
              />
            </div>
          </div>

          {/* EventCardWithCart - Default */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">EventCardWithCart - Default</h3>
            <div className="max-w-sm">
              <EventCardWithCart event={testEventWithCart} />
            </div>
          </div> */}

          {/* EventCardWithCart - Large */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">EventCardWithCart - Large</h3>
            <div className="max-w-md">
              <EventCardWithCart event={testEventWithCart} variant="large" />
            </div>
          </div> */}

          {/* EventCardWithCart - Compact */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">EventCardWithCart - Compact</h3>
            <div className="max-w-lg">
              <EventCardWithCart event={testEventWithCart} variant="compact" />
            </div>
          </div> */}

          {/* EventCardSkeleton */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">EventCardSkeleton (загрузочное состояние)</h3>
            <div className="max-w-sm">
              <EventCardSkeleton />
            </div>
          </div>
        </section>

        {/* 2. Сетка карточек */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Сетка карточек (EventsGrid)</h2>
          <EventsGrid events={testEvents} />
        </section>

        {/* 3. Карта событий */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Карта событий (EventsMap)</h2>
          <EventsMap events={testEvents} />
        </section>

        {/* 4. Переключатель видов */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Переключатель видов (EventsViewToggleOnly)</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <EventsViewProvider>
              <EventsViewToggleOnly />
            </EventsViewProvider>
          </div>
        </section>

        {/* 5. Интерактивные категории */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Интерактивные категории (InteractiveCategories)</h2>
          <InteractiveCategories categories={testCategories} />
        </section>

        {/* 6. Фильтры */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Фильтры</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryFilter categoryStats={categoryStats} />
            <AgeFilter />
            <PriceFilter />
          </div>
        </section>

        {/* 7. Полный EventsPageWrapper */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Полный EventsPageWrapper</h2>
          <EventsViewProvider>
            <EventsPageWrapper events={testEvents} />
          </EventsViewProvider>
        </section>

        {/* 8. Сообщение об отсутствии событий */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Сообщение об отсутствии событий (NoEventsMessage)</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <NoEventsMessage />
          </div>
        </section>

        {/* 9. Детальная страница события */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Детальная страница события</h2>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-6">
              {testEvents[0].coverImage && (
                <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={testEvents[0].coverImage}
                    alt={testEvents[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{testEvents[0].title}</h3>
                {testEvents[0].category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                    {testEvents[0].category}
                  </span>
                )}
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>📅 {new Date(testEvents[0].startDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🕐 {new Date(testEvents[0].startDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} — {new Date(testEvents[0].endDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📍 {testEvents[0].venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>👥 {testEvents[0].ageGroups ? JSON.parse(testEvents[0].ageGroups).join(', ') : `${testEvents[0].ageFrom}+ лет`}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>💰 {(() => {
                      try {
                        const tickets = JSON.parse(testEvents[0].tickets)
                        if (Array.isArray(tickets) && tickets.length > 0) {
                          const prices = tickets.map(t => t.price).filter(p => p > 0)
                          if (prices.length === 0) return 'Бесплатно'
                          const minPrice = Math.min(...prices)
                          return minPrice === 0 ? 'Бесплатно' : `от ${minPrice} ₽`
                        }
                      } catch {}
                      return 'Бесплатно'
                    })()}</span>
                  </div>
                </div>
              </div>
            </div>
            {testEvents[0].description && (
              <div className="mt-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Описание</h4>
                <p className="text-gray-700 leading-relaxed">{testEvents[0].description}</p>
              </div>
            )}
          </div>
        </section>

        {/* 10. Различные состояния карточек */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Различные состояния карточек</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Карточка с изображением */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-2">С изображением</h4>
              <AfishaEventCard event={testEvents[0]} />
            </div>
            
            {/* Карточка без изображения */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-2">Без изображения</h4>
              <AfishaEventCard event={testEvents[1]} />
            </div>
            
            {/* Карточка с бесплатным билетом */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-2">Бесплатное событие</h4>
              <AfishaEventCard event={testEvents[1]} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
