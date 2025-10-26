'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type ViewType = 'grid' | 'map'

interface EventsViewContextType {
  view: ViewType
  setView: (view: ViewType) => void
}

const EventsViewContext = createContext<EventsViewContextType | undefined>(undefined)

export function EventsViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>('grid')

  return (
    <EventsViewContext.Provider value={{ view, setView }}>
      {children}
    </EventsViewContext.Provider>
  )
}

export function useEventsView() {
  const context = useContext(EventsViewContext)
  if (context === undefined) {
    throw new Error('useEventsView must be used within an EventsViewProvider')
  }
  return context
}
