import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Suspense } from 'react'
import ErrorBoundary, { EventsError } from '@/components/ErrorBoundary'
import InfiniteEventsList from '@/components/InfiniteEventsList'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

// Компонент для загрузки начальных данных
async function InitialDataLoader({ citySlug }: { citySlug: string }) {
  const cityName = citySlug === 'moskva' ? 'Москва' : 
                   citySlug === 'spb' ? 'Санкт-Петербург' : citySlug

  // Объединяем критические запросы
  const [events, categories] = await Promise.all([
    // Первые 8 событий
    prisma.afishaEvent.findMany({
      where: {
        status: 'active',
        city: cityName,
        endDate: { gte: new Date() }
      },
      orderBy: [
        { priority: 'asc' },
        { isPromoted: 'desc' },
        { isPopular: 'desc' },
        { viewCount: 'desc' },
        { startDate: 'asc' }
      ],
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        venue: true,
        isPaid: true,
        minPrice: true,
        category: true
      }
    }),

    // Категории
    prisma.afishaCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
  ])

  return (
    <div className="space-y-8">
      {/* Категории */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Категории</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Первые события */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Рекомендуемые события</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              {event.coverImage && (
                <img 
                  src={event.coverImage} 
                  alt={event.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{event.description}</p>
              <p className="text-sm text-gray-500">
                {event.startDate ? new Date(event.startDate).toLocaleDateString('ru-RU') : 'Дата не указана'}
                {event.venue && ` • ${event.venue}`}
              </p>
              <p className="text-sm font-semibold mt-2">
                {event.isPaid ? `От ${event.minPrice || 0} ₽` : 'Бесплатно'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Компонент для ленивой загрузки
function LazyEventsLoader({ citySlug }: { citySlug: string }) {
  return (
    <ErrorBoundary fallback={EventsError}>
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      }>
        <InfiniteEventsList citySlug={citySlug} />
      </Suspense>
    </ErrorBoundary>
  )
}

export default async function OptimizedEventsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Город
  const city = await prisma.city.findUnique({
    where: { slug },
    select: { id: true, name: true, isPublic: true },
  })
  if (!city || !city.isPublic) return notFound()

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">События в {city.name}</h1>
        
        {/* Критические данные - загружаются сразу */}
        <Suspense fallback={
          <div className="space-y-8">
            <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
          </div>
        }>
          <InitialDataLoader citySlug={slug} />
        </Suspense>

        {/* Ленивая загрузка остальных событий */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Все события</h2>
          <LazyEventsLoader citySlug={slug} />
        </div>
      </div>
    </div>
  )
}
