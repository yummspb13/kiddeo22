'use client'

import { useEffect, useRef } from 'react'

interface VenueViewCounterProps {
  venueId: number
}

export default function VenueViewCounter({ venueId }: VenueViewCounterProps) {
  const hasIncremented = useRef(false)

  useEffect(() => {
    // Защита от дублирования запросов
    if (hasIncremented.current) {
      return
    }

    const incrementViewCount = async () => {
      try {
        hasIncremented.current = true
        await fetch(`/api/venues/${venueId}/view`, {
          method: 'POST',
        })
        console.log(`View count incremented for venue ${venueId}`)
      } catch (error) {
        console.error('Error incrementing view count:', error)
        hasIncremented.current = false // Сброс при ошибке
      }
    }

    incrementViewCount()
  }, [venueId])

  return null
}
