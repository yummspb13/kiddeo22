'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { declensionEvents } from '@/lib/declension'

interface EventsCounterProps {
  initialCount: number
  citySlug: string
}

export default function EventsCounter({ initialCount, citySlug }: EventsCounterProps) {
  const [count, setCount] = useState(initialCount)
  const searchParams = useSearchParams()

  useEffect(() => {
    const updateCount = async () => {
      try {
        const params = new URLSearchParams()
        searchParams.forEach((value, key) => {
          params.set(key, value)
        })
        
        const response = await fetch(`/api/events?city=${citySlug}&${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          const newCount = data.pagination?.totalEvents || 0
          setCount(newCount)
        }
      } catch (error) {
        console.error('Error updating events count:', error)
      }
    }

    // Небольшая задержка для обновления
    const timeoutId = setTimeout(updateCount, 100)
    return () => clearTimeout(timeoutId)
  }, [searchParams, citySlug])

  return (
    <div className="text-lg font-semibold text-gray-800">
      Найдено {count} {declensionEvents(count)}
    </div>
  )
}
