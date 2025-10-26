// src/app/city/[slug]/cat/events/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Suspense } from 'react'
import { Unbounded } from 'next/font/google'
import EventsTimeline from '@/components/EventsTimeline'
import EventsPageWrapper from '@/components/EventsPageWrapper'
import EventsViewToggleOnly from '@/components/EventsViewToggleOnly'
import { EventsViewProvider } from '@/contexts/EventsViewContext'
import EventsDisplay from '@/components/EventsDisplay'
import EventsSort from '@/components/EventsSort'
import PriceFilter from '@/components/PriceFilter'
import CategoryFilter from '@/components/CategoryFilter'
import AgeFilter from '@/components/AgeFilter'
import EventsList from '@/components/EventsList'
import CategoryCards from '@/components/CategoryCards'
import EventsCounter from '@/components/EventsCounter'
import { str as sstr, parseCsvParam } from "@/lib/query"
import { ageBuckets, priceBuckets } from "@/config/afishaFilters"
import { getMinActivePrice, inRange } from "@/lib/price"
import { HeaderBannerAd, SidebarAd } from '@/components/AdSlot'
import { logger } from '@/lib/logger'

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
  const startTime = Date.now()
  logger.debug('EventsPage', 'Starting getBaseFilters', { citySlug: props.citySlug })

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
          { title: { contains: q } },
          { description: { contains: q } },
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
    // Добавляем время для корректного сравнения
    dateToDate.setHours(23, 59, 59, 999)
    
    where.AND = [
      ...(where.AND || []),
      {
        AND: [
          // Событие должно пересекаться с диапазоном дат
          { startDate: { lte: dateToDate } },
          { endDate: { gte: dateFromDate } }
        ]
      }
    ]
  } else if (dateFromS) {
    const dateFrom = new Date(dateFromS)
    const dateFromDate = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())
    where.AND = [
      ...(where.AND || []),
      { endDate: { gte: dateFromDate } }
    ]
  } else if (dateToS) {
    const dateTo = new Date(dateToS)
    const dateToDate = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate())
    dateToDate.setHours(23, 59, 59, 999)
    where.AND = [
      ...(where.AND || []),
      { startDate: { lte: dateToDate } }
    ]
  } else {
    // Если дата не указана — показываем только актуальные/будущие события
    const now = new Date()
    where.AND = [
      ...(where.AND || []),
      { endDate: { gte: now } }
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

  // Фильтр по бесплатным событиям
  const free = str((props.sp as any).free)
  
  if (free === '1') {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { tickets: null },
          { tickets: { equals: '[]' } },
          { tickets: { equals: 'null' } },
          { tickets: { contains: '"price":0' } },
          { tickets: { contains: '"price":null' } }
        ]
      }
    ]
  }

  const duration = Date.now() - startTime
  logger.info('EventsPage', 'getBaseFilters completed', { duration })

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
          { title: { contains: q } },
          { description: { contains: q } },
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
      {
        OR: [
          { isPaid: false },
          { isPaid: null },
          { tickets: null },
          { tickets: { equals: '[]' } },
          { tickets: { equals: 'null' } },
          { tickets: { contains: '"price":0' } },
          { tickets: { contains: '"price":null' } }
        ]
      }
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

  // Обработка быстрых фильтров
  const quickFilterIds = str(props.sp.quickFilters)?.split(',').map(Number) || []
  if (quickFilterIds.length > 0) {
    const quickFiltersData = await prisma.quickFilter.findMany({
      where: {
        id: { in: quickFilterIds },
        page: 'afisha',
        isActive: true
      }
    })
    
    for (const qf of quickFiltersData) {
      if (qf.queryJson) {
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
  }

  // Фильтрация по быстрым фильтрам (quickFilterIds в событиях)
  if (quickFilterIds.length > 0) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: quickFilterIds.map(id => ({
          quickFilterIds: { contains: `[${id}]` }
        }))
      }
    ]
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
      
      // Если активен фильтр "Бесплатно", показываем только бесплатные события
      if (isFreeFilter) {
        return p === 0 && e.isPaid === false
      }
      
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
  } else if (isFreeFilter) {
    // Если нет selectedPriceRanges, но активен фильтр "Бесплатно"
    candidates = candidates.filter(e => {
      const p = getMinActivePrice(e.tickets, e.isPaid)
      return p === 0 && e.isPaid === false
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
  const startTime = Date.now()
  logger.debug('EventsPage', 'Page render started')

  const { slug } = await params
  const sp = await searchParams

  // Город
  const city = await prisma.city.findUnique({
    where: { slug },
    select: { id: true, name: true, isPublic: true },
  })
  if (!city || !city.isPublic) return notFound()

  // Загружаем события с базовыми фильтрами
  const baseWhere = await getBaseFilters({ citySlug: slug, sp })
  
  // Добавляем фильтрацию по быстрым фильтрам
  const quickFilterIds = str(sp.quickFilters)?.split(',').map(Number) || []
  if (quickFilterIds.length > 0) {
    baseWhere.AND = [
      ...(baseWhere.AND || []),
      {
        OR: quickFilterIds.map(id => ({
          quickFilterIds: { contains: `[${id}]` }
        }))
      }
    ]
  }
  
  const events = await prisma.afishaEvent.findMany({
    where: baseWhere,
    orderBy: [
      { priority: 'asc' },      // Сначала по приоритету (меньше = выше)
      { isPromoted: 'desc' },   // Продвигаемые события
      { isPopular: 'desc' },    // Популярные события
      { viewCount: 'desc' },    // По количеству просмотров
      { startDate: 'asc' }      // По дате начала
    ],
    select: {
      id: true, title: true, slug: true, description: true, venue: true, organizer: true,
      startDate: true, endDate: true, coordinates: true, coverImage: true, gallery: true,
      tickets: true, city: true, citySlug: true, category: true, categoryId: true,
      ageFrom: true, ageTo: true, isPaid: true, minPrice: true,
      ageGroups: true, createdAt: true, updatedAt: true, priority: true,
      isPromoted: true, isPopular: true, viewCount: true
    },
    take: 20
  })
  
  const pagination = { page: 1, totalPages: 1, totalEvents: events.length, hasMore: false }

  // Получаем категории из таблицы AfishaCategory с правильной сортировкой
  const afishaCategories = await prisma.afishaCategory.findMany({
    where: {
      isActive: true
    },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  })

  // Получаем только те категории, в которых есть активные события в данном городе
  const categoriesWithEvents = await Promise.all(
    afishaCategories.map(async (cat) => {
      const eventCount = await prisma.afishaEvent.count({
        where: {
          status: 'active',
          city: city.name,
          category: cat.name
        }
      })
      return { ...cat, eventCount }
    })
  )

  // Фильтруем только категории с событиями
  const categories = categoriesWithEvents
    .filter(cat => cat.eventCount > 0)
    .map(cat => cat.name)

  // Статистика для фильтров с умной сортировкой
  const categoryStats = await Promise.all(
    categoriesWithEvents
      .filter(cat => cat.eventCount > 0)
      .map(async (cat) => {
        // Получаем статическое количество событий в категории (без текущих фильтров)
        const staticCount = await prisma.afishaEvent.count({
          where: {
            status: 'active',
            city: city.name,
            category: cat.name
          }
        })
        
        // Получаем динамическое количество для фильтров
    const count = await prisma.afishaEvent.count({
      where: {
        ...baseWhere,
            category: cat.name
          }
        })
        
        // Получаем дополнительную информацию о категории для сортировки
        const categoryInfo = await prisma.afishaEvent.findFirst({
          where: {
            ...baseWhere,
            category: cat.name
          },
          select: {
            priority: true,
            isPromoted: true,
            isPopular: true,
            viewCount: true
          },
          orderBy: [
            { priority: 'asc' },
            { isPromoted: 'desc' },
            { isPopular: 'desc' },
            { viewCount: 'desc' }
          ]
        })
        
        return { 
          category: cat.name,
          count, // Динамическое количество для фильтров
          staticCount, // Статическое количество для отображения в карточках
          priority: categoryInfo?.priority || 5,
          isPromoted: categoryInfo?.isPromoted || false,
          isPopular: categoryInfo?.isPopular || false,
          viewCount: categoryInfo?.viewCount || 0,
          // Добавляем данные из таблицы категорий
          sortOrder: cat.sortOrder,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          coverImage: cat.coverImage,
        }
      })
  )
  
  // Сортируем категории по умному алгоритму с учетом sortOrder из таблицы категорий
  categoryStats.sort((a, b) => {
    // Сначала по sortOrder из таблицы категорий
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder
    }
    
    // Затем по приоритету событий (меньше = выше)
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    
    // Затем продвигаемые категории
    if (a.isPromoted !== b.isPromoted) {
      return b.isPromoted ? 1 : -1
    }
    
    // Затем популярные категории
    if (a.isPopular !== b.isPopular) {
      return b.isPopular ? 1 : -1
    }
    
    // Затем по количеству просмотров
    if (a.viewCount !== b.viewCount) {
      return b.viewCount - a.viewCount
    }
    
    // Наконец по количеству событий
    return b.count - a.count
  })

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

  // Получаем быстрые фильтры для афиши
  const quickFilters = await prisma.quickFilter.findMany({
    where: {
      page: 'afisha',
      isActive: true,
      OR: [
        { cityId: null }, // Глобальные фильтры
        { cityId: city.id } // Фильтры для конкретного города
      ]
    },
    orderBy: { order: 'asc' }
  })

  const duration = Date.now() - startTime
  logger.info('EventsPage', 'Page render completed', { 
    eventsCount: events.length,
    categoriesCount: categoryStats.length,
    duration 
  })

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Main Content */}
      <EventsViewProvider>
      <main className="max-w-7xl mx-auto py-8">
        {/* Beautiful Categories Section */}
        <CategoryCards 
          categories={categoryStats.map(stat => ({
            id: Math.random(), // Временный ID
            name: stat.category || 'Без категории',
            slug: stat.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
            description: stat.description || `Увлекательные ${stat.category?.toLowerCase() || 'мероприятия'} для детей`,
            icon: stat.icon ?? undefined,
            color: stat.color ?? undefined,
            coverImage: stat.coverImage ?? undefined, // Добавляем coverImage из таблицы категорий
            eventCount: stat.staticCount, // Используем статическое количество
            isPopular: stat.isPopular || stat.count > 10,
            isNew: stat.count < 5,
            isTrending: stat.count > 15,
            isPromoted: stat.isPromoted,
            priority: stat.priority,
          }))} 
          citySlug={slug} 
        />

        {/* Рекламный слот 1 - полоска над "Все события" */}
        <div className="mb-6 px-4">
          <HeaderBannerAd citySlug={slug} />
        </div>

        {/* Timeline Filters Section */}
        <section className="mb-12 px-2 sm:px-3 lg:px-4">
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
            quickFilters={quickFilters}
          />
        </section>

        {/* Main Content with Map and Events */}
        <div className="px-2 sm:px-3 lg:px-4">
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

            {/* Рекламный слот 2 - слева под фильтрами (в виде карты событий) */}
            <div className="bg-gray-200 rounded-lg h-64 mb-6 mt-5 shadow-lg flex items-center justify-center">
              <SidebarAd citySlug={slug} />
            </div>

          </div>

          {/* Right Side - Events List */}
          <div className="lg:col-span-2">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <EventsCounter initialCount={pagination.totalEvents} citySlug={slug} />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <EventsSort citySlug={slug} />
                <EventsViewToggleOnly />
              </div>
          </div>

                    {/* Events Display */}
                    <EventsDisplay 
                      events={events} 
                      citySlug={slug} 
                      searchParams={sp} 
                      pagination={pagination} 
                    />
          </div>
          </div>
        </div>
      </main>
      </EventsViewProvider>

    </div>
  )
}