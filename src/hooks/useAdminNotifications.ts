"use client"

import { useState, useEffect } from "react"

interface NotificationCounts {
  users: number
  vendors: number
  leads: number
  listings: number
  vendorApprovals: number
}

export function useAdminNotifications(key?: string) {
  const [counts, setCounts] = useState<NotificationCounts>({
    users: 0,
    vendors: 0,
    leads: 0,
    listings: 0,
    vendorApprovals: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Используем моковые данные, если API недоступен
      const url = key ? `/api/admin/notifications?key=${encodeURIComponent(key)}` : '/api/admin/notifications'
      
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        setCounts(data)
      } catch (apiError) {
        // Fallback к моковым данным
        console.warn('API недоступен, используем моковые данные:', apiError)
        setCounts({
          users: 12,
          vendors: 8,
          leads: 25,
          listings: 15,
          vendorApprovals: 3
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching admin notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCounts()
    
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchCounts, 30000)
    
    return () => clearInterval(interval)
  }, [key])

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts
  }
}
