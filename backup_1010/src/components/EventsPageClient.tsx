'use client'

import { useState } from 'react'
import EventsViewToggle from './EventsViewToggle'
import EventsDisplay from './EventsDisplay'

interface EventsPageClientProps {
  events: unknown[]
}

export default function EventsPageClient({ events }: EventsPageClientProps) {
  const [view, setView] = useState<'grid' | 'map'>('grid')

  const handleViewChange = (newView: 'grid' | 'map') => {
    setView(newView)
  }

  return (
    <>
      <EventsViewToggle events={events} onViewChange={handleViewChange} />
      <EventsDisplay events={events} view={view} />
    </>
  )
}
