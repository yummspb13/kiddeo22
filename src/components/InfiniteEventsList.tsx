'use client'

import { useInfiniteEvents } from '@/hooks/useEvents'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, DollarSign } from 'lucide-react'

interface InfiniteEventsListProps {
  citySlug: string
}

export default function InfiniteEventsList({ citySlug }: InfiniteEventsListProps) {
  const cityName = citySlug === 'moskva' ? 'Москва' : 
                   citySlug === 'spb' ? 'Санкт-Петербург' : citySlug

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteEvents(cityName)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px'
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Ошибка загрузки событий</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  const allEvents = data?.pages.flatMap(page => page.events) || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEvents.map((event) => (
          <Link
            key={event.id}
            href={`/event/${event.slug}`}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="aspect-video relative overflow-hidden">
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {event.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {event.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {(() => {
                    try {
                      const date = new Date(event.startDate)
                      if (Number.isNaN(date.getTime())) {
                        return 'Дата уточняется'
                      }
                      return date.toLocaleDateString('ru-RU')
                    } catch (error) {
                      return 'Дата уточняется'
                    }
                  })()}
                </div>
                {event.venue && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.venue}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {event.afishaCategory?.name}
                </span>
                <div className="flex items-center text-sm font-semibold">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {event.isPaid ? `От ${event.minPrice || 0} ₽` : 'Бесплатно'}
                </div>
              </div>
            </div>
          </Link>
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
