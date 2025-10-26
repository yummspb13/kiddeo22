'use client'

import { useInfiniteEvents } from '@/hooks/useEvents'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ErrorBoundary, { EventsError } from '@/components/ErrorBoundary'
import AfishaEventCard from '@/components/AfishaEventCard'

interface EventsWithLazyLoadingProps {
  citySlug: string
  initialEvents: any[]
}

export default function EventsWithLazyLoading({ citySlug, initialEvents }: EventsWithLazyLoadingProps) {
  const cityName = citySlug === 'moskva' ? 'Москва' : 
                   citySlug === 'spb' ? 'Санкт-Петербург' : citySlug

  // Получаем параметры фильтрации из URL
  const searchParams = useSearchParams()
  const filters = Object.fromEntries(searchParams.entries())

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteEvents(cityName, filters)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Показываем начальные события + лениво загруженные
  // Фильтрация происходит на сервере при загрузке initialEvents
  const lazyEvents = data?.pages.flatMap(page => page.events) || []
  
  // Объединяем события и убираем дубликаты по ID
  const allEvents = [
    ...initialEvents,
    ...lazyEvents.filter(lazyEvent => 
      !initialEvents.some(initialEvent => initialEvent.id === lazyEvent.id)
    )
  ]

  if (error) {
    return (
      <ErrorBoundary fallback={EventsError}>
        <div className="text-center py-8">
          <p className="text-red-600">Ошибка загрузки событий</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Попробовать снова
          </button>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allEvents.map((event) => (
          <AfishaEventCard
            key={event.id}
            event={event}
            citySlug={citySlug}
          />
        ))}
      </div>

      {/* Индикатор загрузки */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Кнопка "Загрузить еще" для мобильных устройств */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center">
          <button
            ref={ref}
            onClick={() => fetchNextPage()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Загрузить еще
          </button>
        </div>
      )}

      {/* Конец списка */}
      {!hasNextPage && allEvents.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Все события загружены
        </div>
      )}
    </div>
  )
}
