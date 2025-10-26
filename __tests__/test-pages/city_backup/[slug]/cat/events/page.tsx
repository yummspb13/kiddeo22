// src/app/city/[slug]/cat/events/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import AfishaEventCard from '@/components/AfishaEventCard'
import Link from 'next/link'
import { Suspense } from 'react'
import { Unbounded } from 'next/font/google'
import EventsTimeline from '@/components/EventsTimeline'
import NoEventsMessage from '@/components/NoEventsMessage'
import EventsPageWrapper from '@/components/EventsPageWrapper'
import EventsViewToggleOnly from '@/components/EventsViewToggleOnly'
import { EventsViewProvider } from '@/contexts/EventsViewContext'
import PriceFilter from '@/components/PriceFilter'
import CategoryFilter from '@/components/CategoryFilter'
import AgeFilter from '@/components/AgeFilter'
import InteractiveCategories from '@/components/InteractiveCategories'
import { ageBuckets, priceBuckets } from "@/config/afishaFilters"
import { getMinActivePrice, inRange } from "@/lib/price"
import { parseCsvParam, str as sstr } from "@/lib/query"
import { declensionEvents } from '@/lib/declension'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

function str(v: unknown): string | undefined {
  const s = typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined
  return s?.trim() ? s.trim() : undefined
}

// Функция для получения базовых фильтров (без фильтра по категориям)
async function getBaseFilters(props: {
  citySlug: string
  sp: Record<string, unknown>
}) {
  const where: any = {
    status: 'active',
    city: props.citySlug === 'moskva' ? 'Москва' : 
          props.citySlug === 'spb' ? 'Санкт-Петербург' : undefined
  }

  // Поиск
  const q = str(props.sp.q)
  if (q) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      }
    ]
  }

  // Даты
  const dateFromS = str(props.sp.dateFrom)
  const dateToS = str(props.sp.dateTo)

  // Обработка фильтров по дате
  if (dateFromS && dateToS) {
    // Создаем даты без добавления времени, чтобы избежать проблем с часовыми поясами
    const dateFrom = new Date(dateFromS)
    const dateTo = new Date(dateToS)
    
    // Сравниваем только даты, без времени
    const dateFromDate = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())
    const dateToDate = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate())
    
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          // Событие начинается в диапазоне
          { 
            startDate: { 
              gte: dateFromDate,
              lte: dateToDate
            }
          },
          // Событие заканчивается в диапазоне
          { 
            endDate: { 
              gte: dateFromDate,
              lte: dateToDate
            }
          },
          // Событие охватывает весь диапазон
          {
            AND: [
              { startDate: { lte: dateFromDate } },
              { endDate: { gte: dateToDate } }
            ]
          }
        ]
      }
    ]
  } else if (dateFromS) {
    const dateFrom = new Date(dateFromS)
    const dateFromDate = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { startDate: { gte: dateFromDate } },
          { endDate: { gte: dateFromDate } }
        ]
      }
    ]
  } else if (dateToS) {
    const dateTo = new Date(dateToS)
    const dateToDate = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate())
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { startDate: { lte: dateToDate } },
          { endDate: { lte: dateToDate } }
        ]
      }
    ]
  } else {
    // Если дата не указана — показываем только актуальные/будущие события
    const now = new Date()
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { startDate: { gte: now } },
          { endDate: { gte: now } }
        ]
      }
    ]
  }

  // Фильтр по возрасту
  const ageMin = str((props.sp as any).ageMin)
  const ageMax = str((props.sp as any).ageMax)
  if (ageMin || ageMax) {
    const ageFilter: any = {}
    if (ageMin) ageFilter.gte = parseInt(ageMin)
    if (ageMax) ageFilter.lte = parseInt(ageMax)
    where.ageFrom = ageFilter
  }

  // Временно отключаем фильтрацию по цене из-за проблем с полем tickets
  // const free = str((props.sp as any).free)
  // 
  // if (free === '1') {
  //   where.AND = [
  //     ...(where.AND || []),
  //     {
  //       OR: [
  //         { tickets: null },
  //         { tickets: { equals: '[]' } },
  //         { tickets: { equals: 'null' } },
  //         { tickets: { contains: '"price":0' } },
  //         { tickets: { contains: '"price":null' } }
  //       ]
  //     }
  //   ]
  // }

  return where
}

// Функция загрузки событий
async function loadAfishaEvents(props: {
  citySlug: string
  sp: Record<string, unknown>
}) {
  const where: any = {
    status: 'active',
    city: props.citySlug === 'moskva' ? 'Москва' : 
          props.citySlug === 'spb' ? 'Санкт-Петербург' : undefined
  }

  // Поиск
  const q = sstr(props.sp.q)
  if (q) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      }
    ]
  }

  // Даты - исправляем пересечение диапазонов
  const dateFromS = sstr(props.sp.dateFrom)
  const dateToS = sstr(props.sp.dateTo)

  if (dateFromS && dateToS) {
    const dateFrom = new Date(dateFromS + 'T00:00:00.000Z')
    const dateTo = new Date(dateToS + 'T23:59:59.999Z')

    // Пересечение интервалов: (start<=to) && (end>=from)
    where.AND = [
      ...(where.AND || []),
      {
        AND: [
          { startDate: { lte: dateTo } },
          { endDate:   { gte: dateFrom } }
        ]
      }
    ]
  } else if (dateFromS) {
    const dateFrom = new Date(dateFromS)
    where.AND = [
      ...(where.AND || []),
      { endDate: { gte: dateFrom } }
    ]
  } else {
    // Если дата не указана — показываем только актуальные/будущие события
    const now = new Date()
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { startDate: { gte: now } },
          { endDate: { gte: now } }
        ]
      }
    ]
  }

  // Фильтр по бесплатным событиям
  const isFreeFilter = sstr(props.sp.free) === '1'
  if (isFreeFilter) {
    where.AND = [
      ...(where.AND || []),
      { isPaid: false }
    ]
  }

  // Чтение выбранных корзин
  const selectedAgeSlugs = parseCsvParam(props.sp, "age")
  const selectedPriceSlugs = parseCsvParam(props.sp, "price")

  let selectedAgeRanges = ageBuckets.filter(b => selectedAgeSlugs.includes(b.slug)).map(b => b.range)
  let selectedPriceRanges = priceBuckets.filter(b => selectedPriceSlugs.includes(b.slug)).map(b => b.range)

  // Обратная совместимость с quickFilter
  const quickFilterLabel = sstr(props.sp.quickFilter)
  if (quickFilterLabel) {
    const qf = await prisma.quickFilter.findFirst({
      where: { page: 'afisha', label: quickFilterLabel, isActive: true }
    })
    if (qf?.queryJson) {
      const j = qf.queryJson as any
      if (Array.isArray(j.ageGroups)) {
        // маппинг названия группы -> слаг (по label)
        const add = ageBuckets.filter(b => j.ageGroups.includes(b.label)).map(b => b.slug)
        selectedAgeRanges.push(...ageBuckets.filter(b => add.includes(b.slug)).map(b => b.range))
      }
      if (j.isPaid === false) {
        selectedPriceRanges.push({ max: 0 }) // free
      }
      if (j.priceRange) {
        selectedPriceRanges.push({ min: j.priceRange.min ?? undefined, max: j.priceRange.max ?? undefined })
      }
    }
  }

  // Возраст — простая логика: если кнопка нажата, показываем событие
  if (selectedAgeRanges.length > 0) {
    const ageOr = selectedAgeRanges.map(r => {
      const min = r.min ?? 0
      const max = r.max ?? 99
      
      // Простое сопоставление диапазонов с ageGroups
      const ageGroupStrings: string[] = []
      if (min === 0 && max === 3) ageGroupStrings.push('0-3')
      if (min === 4 && max === 7) ageGroupStrings.push('4-7')
      if (min === 8 && max === 12) ageGroupStrings.push('8-12')
      if (min === 13 && max === 16) ageGroupStrings.push('13-16')
      if (min === 16 && max === null) ageGroupStrings.push('16-plus')
      
      // Если есть соответствующие ageGroups, ищем их в базе
      if (ageGroupStrings.length > 0) {
        return {
          OR: ageGroupStrings.map(group => ({
            ageGroups: { contains: group }
          }))
        }
      }
      
      // Если нет соответствующих ageGroups, не показываем событие
      return { id: { equals: 'never-match' } }
    })
    where.AND = [ ...(where.AND || []), { OR: ageOr } ]
  }

  // Загрузка кандидатов БЕЗ пагинации
  let candidates = await prisma.afishaEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, slug: true, description: true, venue: true, organizer: true,
      startDate: true, endDate: true, coordinates: true, order: true, status: true,
      coverImage: true, gallery: true, tickets: true, city: true, category: true,
      categoryId: true, createdAt: true, updatedAt: true, ageFrom: true, ageTo: true,
      ageGroups: true, viewCount: true, isPopular: true, isPaid: true, isPromoted: true, priority: true
    }
  })

  // JS-фильтрация по цене (мультивыбор)
  if (selectedPriceRanges.length > 0) {
    candidates = candidates.filter(e => {
      const p = getMinActivePrice(e.tickets, e.isPaid)
      // "free": p === 0; иначе проверяем попадание в ЛЮБУЮ из выбранных корзин
      if (p === 0) {
        // входит в любую корзину, где max >= 0 или где min отсутствует/0
        return selectedPriceRanges.some(r => {
          if (r.max != null && r.max >= 0) return true
          if (r.min == null || r.min === 0) return true
          return false
        })
      }
      if (p == null) return false
      return selectedPriceRanges.some(r => inRange(p, r))
    })
  }

  // JS-фильтрация по категориям
  const categoriesParam = sstr(props.sp.categories)
  if (categoriesParam) {
    const selectedCategories = categoriesParam.split(',')
    candidates = candidates.filter((event: any) => 
      selectedCategories.includes(event.category)
    )
  }

  // Пагинация ПОСЛЕ фильтра
  const page = parseInt(sstr(props.sp.page) || '1')
  const limit = 20
  const totalEvents = candidates.length
  const totalPages = Math.ceil(totalEvents / limit)
  const events = candidates.slice((page - 1) * limit, page * limit)
  const hasMore = page < totalPages

  return {
    events,
    pagination: {
      page,
      totalPages,
      hasMore,
      totalEvents
    }
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const sp = await searchParams

  // Город
  const city = await prisma.city.findUnique({
    where: { slug },
    select: { id: true, name: true, isPublic: true },
  })
  if (!city || !city.isPublic) return notFound()

  // Временно упрощаем - не загружаем события
  const events: any[] = []
  const pagination = { page: 1, totalPages: 1, totalEvents: 0, hasMore: false }

  // Получаем все уникальные категории для фильтров
  const allCategories = await prisma.afishaEvent.findMany({
    where: {
      status: 'active',
      city: city.name,
      category: { not: null }
    },
    select: { category: true },
    distinct: ['category']
  })

  const categories = allCategories
    .map(c => c.category)
    .filter((category): category is string => Boolean(category))
    .sort()

  // Получаем базовые фильтры для статистики (без фильтра по категориям)
  const baseWhere = await getBaseFilters({ citySlug: slug, sp })
  
  // Упрощенная статистика для фильтров
  const categoryStats = categories.map(category => ({
    category,
    count: 0 // Временно отключаем подсчет
  }))

  // Получаем статистику по возрастам
  const ageStats = await Promise.all([
    { label: '0-3 года', min: 0, max: 3 },
    { label: '4-7 лет', min: 4, max: 7 },
    { label: '8-12 лет', min: 8, max: 12 },
    { label: '13+ лет', min: 13, max: 99 }
  ].map(async ({ label, min, max }) => {
    const count = await prisma.afishaEvent.count({
      where: {
        ...baseWhere,
        AND: [
          // Событие подходит, если его возрастной диапазон пересекается с заданным
          // Два диапазона пересекаются, если начало одного <= конец другого и наоборот
          {
            AND: [
              { ageFrom: { lte: max } },  // начало события <= конец диапазона
              { ageTo: { gte: min } }     // конец события >= начало диапазона
            ]
          }
        ]
      }
    })
    return { label, count }
  }))

  // Получаем статистику по ценам
  const priceStats = await Promise.all([
    { label: 'Бесплатно', condition: { isPaid: false } },
    { label: 'До 500 ₽', condition: { isPaid: true } }, // Пока считаем все платные события как "До 500 ₽"
    { label: '500-1000 ₽', condition: { isPaid: true } }, // Пока считаем все платные события как "500-1000 ₽"
    { label: '1000+ ₽', condition: { isPaid: true } } // Пока считаем все платные события как "1000+ ₽"
  ].map(async ({ label, condition }) => {
    const count = await prisma.afishaEvent.count({
      where: {
        ...baseWhere,
        ...condition
      }
    })
    return { label, count }
  }))

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">События в {city.name}</h1>
          <p className="text-xl mb-8">Найдите интересные мероприятия для всей семьи</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="text" 
              placeholder="Поиск событий..." 
              className="px-6 py-3 rounded-lg text-gray-900 w-full sm:w-96"
            />
            <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
              Найти
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <EventsViewProvider>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Interactive Categories Section */}
        <InteractiveCategories categories={categoryStats.map(stat => ({
          name: stat.category || 'Без категории',
          slug: stat.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
          count: stat.count
        }))} />

        {/* Timeline Filters Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-lg">🎭</span>
            </div>
            <h2 className="text-3xl font-bold">Все события</h2>
          </div>
          
          <EventsTimeline 
            categoryStats={categoryStats}
            ageStats={ageStats}
            priceStats={priceStats}
            citySlug={slug}
          />
        </section>

        {/* Main Content with Map and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Map and Filters */}
          <div className="lg:col-span-1">
            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-lg h-64 mb-6 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p>Карта событий</p>
              </div>
            </div>

            {/* Categories Filter */}
            <CategoryFilter categoryStats={categoryStats} />

            {/* Age Filter */}
            <AgeFilter />

            {/* Price Filter */}
            <PriceFilter />
          </div>

          {/* Right Side - Events List */}
          <div className="lg:col-span-2">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-lg font-semibold text-gray-800">
                Найдено {pagination.totalEvents} событий
                {pagination.page > 1 && ` (страница ${pagination.page})`}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Сортировка:</span>
                  <select className="bg-white rounded-lg px-3 py-2 border text-sm">
                <option>По дате</option>
                <option>По цене</option>
                <option>По популярности</option>
              </select>
            </div>
                
                <EventsViewToggleOnly />
          </div>
          </div>

            {/* Events Display */}
            <EventsPageWrapper events={events} />

            {events.length === 0 && <NoEventsMessage />}

            {/* Load More Button - показываем только если есть еще страницы */}
            {pagination.hasMore && (
              <div className="text-center py-8">
                <button 
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    const url = new URL(window.location.href)
                    url.searchParams.set('page', (pagination.page + 1).toString())
                    window.location.href = url.toString()
                  }}
                >
                  Показать еще 20 {declensionEvents(20)}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Страница {pagination.page} из {pagination.totalPages} 
                  ({pagination.totalEvents} {declensionEvents(pagination.totalEvents)})
                </p>
            </div>
          )}
          </div>
        </div>
      </main>
      </EventsViewProvider>

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
                  <h3 className="text-lg font-semibold mb-2">Приложение Kiddeo</h3>
                  <p className="text-sm text-gray-600 mb-4">Найдите события в несколько кликов</p>
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
                    <li><a href="#" className="hover:text-red-600">Добавить событие</a></li>
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
                <p>© 2025 Kiddeo. Все права защищены.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

