'use client'

import { useEventsView } from '@/contexts/EventsViewContext'
import EventsDisplay from './EventsDisplay'

interface EventsPageWrapperProps {
  events: unknown[]
}

export default function EventsPageWrapper({ events }: EventsPageWrapperProps) {
  const { view } = useEventsView()

  return <EventsDisplay events={events} view={view} />
}
