'use client'

import { useState, useEffect } from 'react'

interface VenuesStats {
  totalListings: number
  venueCategories: number
  venueSubcategories: number
  venueFilters: number
  venuePartners: number
  venueVendors: number
  generalCategories: number
  stats: {
    totalPlaces: number
    categories: number
    subcategories: number
    filters: number
  }
}

export default function VenuesStatsClient() {
  const [stats, setStats] = useState<VenuesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 VENUES STATS CLIENT: Starting fetch...')
        
        const response = await fetch('/api/admin/venues?key=kidsreview2025', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        console.log('🔍 VENUES STATS CLIENT: Response status:', response.status)
        console.log('🔍 VENUES STATS CLIENT: Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('🔍 VENUES STATS CLIENT: Response not ok:', response.status, errorText)
          throw new Error(`Failed to fetch stats: ${response.status} ${errorText}`)
        }
        
        const data = await response.json()
        console.log('🔍 VENUES STATS CLIENT: Received data:', data)
        setStats(data)
      } catch (err) {
        console.error('🔍 VENUES STATS CLIENT: Error fetching venues stats:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика раздела "Места"</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика раздела "Места"</h3>
        <div className="text-center text-red-600">
          <p>Ошибка загрузки статистики: {error}</p>
        </div>
      </div>
    )
  }

  if (!stats || !stats.stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика раздела "Места"</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Нет данных</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика раздела "Места"</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.stats?.totalPlaces || 0}</div>
          <div className="text-sm text-gray-600">Всего мест</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.stats?.categories || 0}</div>
          <div className="text-sm text-gray-600">Категорий</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.stats?.subcategories || 0}</div>
          <div className="text-sm text-gray-600">Подкатегорий</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.stats?.filters || 0}</div>
          <div className="text-sm text-gray-600">Настроенных фильтров</div>
        </div>
      </div>
      
      {/* Дополнительная статистика */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Детальная статистика</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats?.venuePartners || 0}</div>
            <div className="text-gray-600">Партнеры</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats?.venueVendors || 0}</div>
            <div className="text-gray-600">Вендоры</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats?.venueCategories || 0}</div>
            <div className="text-gray-600">Категории мест</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats?.totalListings || 0}</div>
            <div className="text-gray-600">Общие места</div>
          </div>
        </div>
      </div>
    </div>
  )
}
