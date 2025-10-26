'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

interface ViewCounterProps {
  venueId: number
}

export default function ViewCounter({ venueId }: ViewCounterProps) {
  const [views, setViews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadViewCount = async () => {
      try {
        console.log(`[ViewCounter] Loading view count for venue ${venueId}`)
        const response = await fetch(`/api/venues/${venueId}/view`, {
          method: 'GET',
          cache: 'no-store'
        })
        
        console.log(`[ViewCounter] Response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`[ViewCounter] View count data:`, data)
          setViews(data.viewCount || 0)
        } else {
          console.error(`[ViewCounter] API error: ${response.status}`)
          setError(true)
        }
      } catch (error) {
        console.error('Error loading view count:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadViewCount()
  }, [venueId])

  if (loading) {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 shadow-md">
        <Eye className="w-3 h-3 mr-1" />
        ...
      </div>
    )
  }

  if (error) {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 shadow-md">
        <Eye className="w-3 h-3 mr-1" />
        0
      </div>
    )
  }

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 shadow-md">
      <Eye className="w-3 h-3 mr-1" />
      {views}
    </div>
  )
}
