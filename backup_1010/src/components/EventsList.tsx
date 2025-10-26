'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AfishaEventCard from '@/components/AfishaEventCard'
import NoEventsMessage from '@/components/NoEventsMessage'

interface Event {
  id: string
  title: string
  slug: string
  description?: string
  venue: string
  organizer?: string
  startDate: string
  endDate: string
  coordinates?: string
  coverImage?: string
  gallery?: string
  tickets?: string
  city: string
  category?: string
  ageFrom?: number
  ageTo?: number
  isPaid: boolean
  minPrice?: number
  ageGroups?: string
}

interface EventsListProps {
  citySlug: string
  initialEvents: Event[]
  searchParams: Record<string, string | string[] | undefined>
}

export default function EventsList({ citySlug, initialEvents, searchParams }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false,
    totalEvents: initialEvents.length,
  })
  const routerSearchParams = useSearchParams()

  const loadEvents = async (force = false) => {
    if (loading && !force) return // Предотвращаем множественные запросы
    
    setLoading(true)
    try {
      // Используем routerSearchParams для получения актуальных параметров из URL
      const params = new URLSearchParams()
      
      // Добавляем параметры из URL (включая sortBy)
      routerSearchParams.forEach((value, key) => {
        params.set(key, value)
      })
      
      // Добавляем параметры из пропсов (если они есть)
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && !routerSearchParams.has(key)) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, value)
          }
        }
      })
      
      const response = await fetch(`/api/events?city=${citySlug}&${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
        setPagination(data.pagination || { page: 1, totalPages: 1, hasMore: false, totalEvents: 0 })
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Убираем MutationObserver - он вызывает бесконечный цикл

  // Debounce для loadEvents
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEvents()
    }, 100) // 100мс задержка

    return () => clearTimeout(timeoutId)
  }, [searchParams, citySlug, routerSearchParams])

  // Принудительное обновление при изменении URL
  useEffect(() => {
    const handleUrlChange = () => {
      // Небольшая задержка для обновления routerSearchParams
      setTimeout(() => {
        loadEvents(true)
      }, 50)
    }
    
    window.addEventListener('popstate', handleUrlChange)
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
    }
  }, [])

  // Отслеживание изменений URL только при необходимости
  useEffect(() => {
    const handleUrlChange = () => {
      // Задержка для обновления routerSearchParams
      setTimeout(() => {
        loadEvents(true)
      }, 100)
    }
    
    // Слушаем popstate (навигация браузера)
    window.addEventListener('popstate', handleUrlChange)
    
    // Также слушаем изменения через replaceState (для крестика)
    const originalReplaceState = history.replaceState
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(handleUrlChange, 0)
    }
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      history.replaceState = originalReplaceState
    }
  }, [])


  // Убираем лишние обновления при фокусе

  // Убираем периодическое обновление

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-64"></div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return <NoEventsMessage />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((event) => (
        <AfishaEventCard key={event.id} event={event} citySlug={citySlug} />
      ))}
    </div>
  )
}
