'use client'

import { useEventsView } from '@/contexts/EventsViewContext'
import MobileEventsList from '@/components/MobileEventsList'
import EventsMap from '@/components/EventsMap'

interface MobileEventsDisplayProps {
  events: any[]
  citySlug: string
  searchParams: Record<string, string | string[] | undefined>
}

export default function MobileEventsDisplay({ events, citySlug, searchParams }: MobileEventsDisplayProps) {
  const { view } = useEventsView()

  return (
    <>
      {/* Mobile Events Display */}
      {view === 'grid' ? (
        <MobileEventsList 
          initialEvents={events} 
          citySlug={citySlug} 
          searchParams={searchParams} 
        />
      ) : (
        <EventsMap events={events} />
      )}
    </>
  )
}
