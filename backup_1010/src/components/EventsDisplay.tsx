'use client'

import { useEventsView } from '@/contexts/EventsViewContext'
import EventsList from '@/components/EventsList'
import EventsMap from '@/components/EventsMap'
import { InlineAd } from '@/components/AdSlot'
import { declensionEvents } from '@/lib/declension'

interface EventsDisplayProps {
  events: any[]
  citySlug: string
  searchParams: Record<string, string | string[] | undefined>
  pagination: any
}

export default function EventsDisplay({ events, citySlug, searchParams, pagination }: EventsDisplayProps) {
  const { view } = useEventsView()

  return (
    <>
      {/* Events Display */}
      {view === 'grid' ? (
        <EventsList citySlug={citySlug} initialEvents={events} searchParams={searchParams} />
      ) : (
        <EventsMap events={events} />
      )}

      {/* Load More Button - показываем только если есть еще страницы и вид - сетка */}
      {view === 'grid' && pagination.hasMore && (
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

    </>
  )
}