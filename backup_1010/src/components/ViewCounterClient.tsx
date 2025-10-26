'use client'

import { useEffect, useRef } from 'react'

interface ViewCounterClientProps {
  eventId: number
}

export default function ViewCounterClient({ eventId }: ViewCounterClientProps) {
  const hasIncremented = useRef(false)

  useEffect(() => {
    // Защита от дублирования запросов
    if (hasIncremented.current) {
      return
    }

    const incrementViewCount = async () => {
      try {
        hasIncremented.current = true
        await fetch(`/api/afisha/events/${eventId}/view`, {
          method: 'POST',
        })
        console.log(`View count incremented for event ${eventId}`)
      } catch (error) {
        console.error('Error incrementing view count:', error)
        hasIncremented.current = false // Сброс при ошибке
      }
    }

    incrementViewCount()
  }, [eventId])

  return null
}
