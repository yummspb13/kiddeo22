'use client'

import { Unbounded } from 'next/font/google'
import Gallery from '@/components/Gallery'
import TicketCalculator from '@/components/TicketCalculator'
import SimpleEventReviews from '@/components/SimpleEventReviews'
import { Calendar, MapPin, Clock, Users, Star } from 'lucide-react'
import Image from 'next/image'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

// Тестовые данные для демонстрации внутренних дизайнов
const testEvent = {
  id: "1",
  title: "Изумрудный город",
  description: "Волшебное театральное представление для всей семьи. Дети отправятся в увлекательное путешествие по волшебной стране, где их ждут невероятные приключения, загадки и открытия. Спектакль создан по мотивам известной сказки и адаптирован для современной детской аудитории.",
  coverImage: "/uploads/upload_1759147935103.jpg",
  startDate: "2025-04-04T16:00:00.000Z",
  endDate: "2025-04-04T20:00:00.000Z",
  venue: "Малый Кисловский переулок, 8",
  organizer: "Театр кукол им. С.В. Образцова",
  category: "Театры",
  ageGroups: ["4-7", "8-12"],
  viewCount: 156,
  rating: 4.5,
  reviewsCount: 23,
  tickets: [
    { id: 1, name: "Детский билет", price: 500, description: "Для детей до 12 лет" },
    { id: 2, name: "Взрослый билет", price: 800, description: "Для взрослых" },
    { id: 3, name: "Семейный билет", price: 1200, description: "2 взрослых + 2 ребенка" }
  ],
  gallery: [
    "/uploads/upload_1759147935103.jpg",
    "/uploads/gallery1.jpg",
    "/uploads/gallery2.jpg",
    "/uploads/gallery3.jpg"
  ]
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriceText = () => {
  const prices = testEvent.tickets.map(t => t.price).filter(p => p > 0)
  if (prices.length === 0) return 'Бесплатно'
  const minPrice = Math.min(...prices)
  return minPrice === 0 ? 'Бесплатно' : `от ${minPrice.toLocaleString('ru-RU')} ₽`
}

const renderAge = () => {
  return testEvent.ageGroups.join(', ')
}

export default function TestEventDetailsPage() {
  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Тест дизайнов внутри карточки мероприятия</h1>
          <p className="text-gray-600 mt-2">Демонстрация всех вариантов внутренних страниц событий</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 1. Простая детальная страница события */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Простая детальная страница события (/event/[slug])</h2>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-6">
              {testEvent.coverImage && (
                <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={testEvent.coverImage}
                    alt={testEvent.title}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{testEvent.title}</h1>
                {testEvent.category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                    {testEvent.category}
                  </span>
                )}
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(new Date(testEvent.startDate))}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>
                      {formatTime(new Date(testEvent.startDate))} — {formatTime(new Date(testEvent.endDate))}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>{testEvent.venue}</span>
                  </div>
                  {renderAge() && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>{renderAge()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span className="text-lg font-semibold text-gray-900">{getPriceText()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Описание события */}
          {testEvent.description && (
            <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Описание</h2>
              <p className="text-gray-700 leading-relaxed">{testEvent.description}</p>
            </div>
          )}

          {/* Отзывы */}
          <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
            <SimpleEventReviews eventId={testEvent.id} />
          </div>
        </section>

        {/* 2. Расширенная детальная страница с галереей */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Расширенная детальная страница с галереей (/listing/[slug])</h2>
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Хлебные крошки */}
            <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500">
              <a href="/city/moskva/cat/events" className="hover:underline">Афиша</a>
              <span className="mx-2">/</span>
              <span>{testEvent.title}</span>
            </div>

            {/* HERO секция */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <div className="relative">
                    <Gallery images={testEvent.gallery} variant="slider" />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {getPriceText()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h1 className="text-xl sm:text-3xl font-bold leading-tight">{testEvent.title}</h1>
                  </div>
                </div>

                {/* Описание */}
                {testEvent.description && (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                    <h2 className="text-lg font-semibold mb-2">Описание</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{testEvent.description}</div>
                  </div>
                )}

                {/* Карта */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 bg-white">
                  <div className="p-4 sm:p-6 pb-0">
                    <h2 className="text-lg font-semibold">Локация на карте</h2>
                    <div className="mt-1 text-sm text-gray-600">{testEvent.venue}</div>
                  </div>
                  <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Карта Яндекс</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Боковая панель с билетами */}
              <aside className="lg:col-span-4">
                <div className="rounded-2xl border border-gray-200 p-5 bg-white sticky top-20 space-y-5">
                  {/* Информация о событии */}
                  <div>
                    <div className="text-base font-semibold mb-2">{testEvent.title}</div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                        <div>
                          <div className="font-medium">Дата и время</div>
                          <div>
                            {new Date(testEvent.startDate).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            <span> — </span>
                            {new Date(testEvent.endDate).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                        <div>
                          <div className="font-medium">Адрес</div>
                          <div>
                            {testEvent.venue}
                            <a href="#" className="ml-1 text-blue-600 hover:underline">на карте</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Билеты */}
                  <h2 className="text-lg font-semibold">Билеты</h2>
                  <TicketCalculator
                    tickets={testEvent.tickets.map((t) => ({ id: t.id, name: t.name, price: t.price }))}
                    hideCheckoutButton
                    className="mt-2"
                  />

                  <div className="mt-5">
                    <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Купить билеты
                    </button>
                  </div>

                  {/* Социальное доказательство */}
                  <div className="mt-4 text-xs text-gray-500">
                    Количество мест ограничено. Оплата защищена.
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </section>

        {/* 3. Компоненты по отдельности */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Компоненты по отдельности</h2>
          
          {/* Галерея */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Gallery (слайдер)</h3>
            <div className="max-w-2xl">
              <Gallery images={testEvent.gallery} variant="slider" />
            </div>
          </div>

          {/* Галерея сетка */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Gallery (сетка)</h3>
            <div className="max-w-2xl">
              <Gallery images={testEvent.gallery} variant="grid" />
            </div>
          </div>

          {/* Калькулятор билетов */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">TicketCalculator</h3>
            <div className="max-w-md">
              <TicketCalculator
                tickets={testEvent.tickets.map((t) => ({ id: t.id, name: t.name, price: t.price }))}
                className="mt-2"
              />
            </div>
          </div>

          {/* Отзывы */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">SimpleEventReviews</h3>
            <div className="max-w-2xl">
              <SimpleEventReviews eventId={testEvent.id} />
            </div>
          </div>
        </section>

        {/* 4. Различные состояния */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Различные состояния компонентов</h2>
          
          {/* Событие без изображения */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Событие без изображения</h3>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start space-x-6">
                <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Событие без изображения</h1>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                    Мастер-классы
                  </span>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>5 апреля 2025 г.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>10:00 — 12:00</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Центр творчества 'Палитра'</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5" />
                      <span className="text-lg font-semibold text-gray-900">Бесплатно</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Событие с одним билетом */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Событие с одним типом билета</h3>
            <div className="max-w-md">
              <TicketCalculator
                tickets={[{ id: 1, name: "Входной билет", price: 200 }]}
                className="mt-2"
              />
            </div>
          </div>

          {/* Событие с бесплатными билетами */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Событие с бесплатными билетами</h3>
            <div className="max-w-md">
              <TicketCalculator
                tickets={[{ id: 1, name: "Бесплатный билет", price: 0 }]}
                className="mt-2"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
