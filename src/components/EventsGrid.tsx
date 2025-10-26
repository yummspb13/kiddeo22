'use client'

import AfishaEventCard from './AfishaEventCard'

interface EventsGridProps {
  events: unknown[]
}

export default function EventsGrid({ events }: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event: any) => (
        <AfishaEventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
