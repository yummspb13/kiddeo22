'use client'

import { useState, useEffect } from 'react'
import { Users, Heart, Star, ShoppingBag } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useFavoritesSimple } from '@/hooks/useFavoritesSimple'

interface ProfileStatsData {
  childrenCount: number
  ordersCount: number
  favoritesCount: number
  reviewsCount: number
}

interface ProfileStatsProps {
  onStatsUpdate?: () => void
}

export default function ProfileStats({ onStatsUpdate }: ProfileStatsProps) {
  const { user, loading: userLoading } = useUser()
  const { favorites, loading: favoritesLoading, refetch } = useFavoritesSimple()
  const [stats, setStats] = useState<ProfileStatsData>({
    childrenCount: 0,
    ordersCount: 0,
    favoritesCount: 0,
    reviewsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [favoritesInitialized, setFavoritesInitialized] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id || typeof window === 'undefined') {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/profile/simple-stats', {
          headers: {
            'x-user-id': user.id
          }
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('Failed to fetch profile stats')
        }
      } catch (error) {
        console.error('Error fetching profile stats:', error)
      } finally {
        setLoading(false)
      }
    }

    // Добавляем небольшую задержку для стабильности
    const timeoutId = setTimeout(() => {
      fetchStats()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [user?.id])

  // Принудительно инициализируем избранное при монтировании
  useEffect(() => {
    if (user?.id && !favoritesInitialized) {
      setFavoritesInitialized(true)
      refetch()
    }
  }, [user?.id, favoritesInitialized])

  // Обновляем количество избранного при изменении favorites
  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      setStats(prev => ({
        ...prev,
        favoritesCount: favorites.length
      }))
    }
  }, [favorites?.length])

  if (userLoading || loading || favoritesLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="h-6 bg-gray-300 rounded mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Пользователь не авторизован</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-blue-900">{stats.childrenCount}</div>
        <div className="text-sm text-blue-700">Детей</div>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <ShoppingBag className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-green-900">{stats.ordersCount}</div>
        <div className="text-sm text-green-700">Заказов</div>
      </div>
      <div className="bg-red-50 rounded-lg p-4 text-center">
        <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-red-900">{stats.favoritesCount}</div>
        <div className="text-sm text-red-700">Избранное</div>
      </div>
      <div className="bg-yellow-50 rounded-lg p-4 text-center">
        <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-yellow-900">{stats.reviewsCount}</div>
        <div className="text-sm text-yellow-700">Отзывов</div>
      </div>
    </div>
  )
}
