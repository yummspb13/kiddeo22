'use client'

import { useState, useEffect } from 'react'
import { Star, Eye, TrendingUp, Target } from 'lucide-react'

interface HeroStats {
  activeSlots: number
  totalViews: number
  totalClicks: number
  ctr: number
  totalSlots: number
}

export default function HeroStats() {
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/hero-slots/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('Failed to fetch stats:', response.status)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="ml-3">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Ошибка загрузки статистики</p>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Активных слотов</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeSlots}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Показов</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalViews)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">Кликов</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalClicks)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">CTR</p>
            <p className="text-2xl font-bold text-gray-900">{stats.ctr}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
