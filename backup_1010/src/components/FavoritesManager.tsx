'use client'

import { useState, useEffect } from 'react'
import { Heart, Calendar, MapPin, Star, Trash2, Eye } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useFavoritesSimple } from '@/hooks/useFavoritesSimple'

interface Favorite {
  id: string
  itemId: string
  itemType: string
  title: string
  description?: string
  image?: string
  price?: number
  currency?: string
  location?: string
  date?: string
  createdAt: string
}

interface FavoritesManagerProps {
  onStatsUpdate?: () => void
}

export default function FavoritesManager({ onStatsUpdate }: FavoritesManagerProps) {
  const { user, loading: userLoading } = useUser()
  const { favorites, loading, removeFromFavorites } = useFavoritesSimple()
  const [filter, setFilter] = useState<'all' | 'events' | 'places' | 'services'>('all')
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFavorites, setTotalFavorites] = useState(0)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [paginatedFavorites, setPaginatedFavorites] = useState<Favorite[]>([])

  console.log('🔍 FavoritesManager - User:', user, 'UserLoading:', userLoading, 'Favorites:', favorites)

  // Эффект для пагинации избранного
  useEffect(() => {
    if (favorites.length === 0) {
      setPaginatedFavorites([])
      setTotalFavorites(0)
      setTotalPages(1)
      return
    }

    const filteredFavorites = favorites.filter(favorite => {
      if (filter === 'all') return true
      return favorite.itemType === filter
    })

    setTotalFavorites(filteredFavorites.length)
    setTotalPages(Math.ceil(filteredFavorites.length / 10))

    const startIndex = (currentPage - 1) * 10
    const endIndex = startIndex + 10
    setPaginatedFavorites(filteredFavorites.slice(startIndex, endIndex))
  }, [favorites, filter, currentPage])

  const handleRemove = (favoriteId: string) => {
    if (!user?.id) {
      alert('Пользователь не авторизован')
      return
    }

    if (!confirm('Вы уверены, что хотите удалить из избранного?')) {
      return
    }

    const success = removeFromFavorites(favoriteId)
    if (success) {
      onStatsUpdate?.()
    } else {
      alert('Произошла ошибка при удалении')
    }
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'event':
        return 'Событие'
      case 'place':
        return 'Место'
      case 'service':
        return 'Услуга'
      default:
        return 'Элемент'
    }
  }

  const getItemHref = (favorite: Favorite) => {
    switch (favorite.itemType) {
      case 'event':
        return `/event/${favorite.itemId}`
      case 'place':
        return `/place/${favorite.itemId}`
      case 'service':
        return `/service/${favorite.itemId}`
      default:
        return '#'
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'place':
        return <MapPin className="w-5 h-5 text-green-600" />
      case 'service':
        return <Star className="w-5 h-5 text-purple-600" />
      default:
        return <Heart className="w-5 h-5 text-red-600" />
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'RUB'
    }).format(amount / 100)
  }

  // Удаляем старую логику фильтрации, теперь она в useEffect

  if (userLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Пользователь не авторизован</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Избранное</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('events')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'events' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            События
          </button>
          <button
            onClick={() => setFilter('places')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'places' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Места
          </button>
          <button
            onClick={() => setFilter('services')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'services' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Услуги
          </button>
        </div>
      </div>

      {/* Список избранного */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Избранное</h3>
        <div className="text-sm text-gray-500">
          {totalFavorites} элементов
        </div>
      </div>

      {paginatedFavorites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>У вас пока нет избранного</p>
          <p className="text-sm">Добавьте интересные события, места или услуги</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedFavorites.map((favorite) => (
            <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {favorite.image ? (
                    <img
                      src={favorite.image}
                      alt={favorite.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getItemIcon(favorite.itemType)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getItemTypeLabel(favorite.itemType)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{favorite.title}</h4>
                      {favorite.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {favorite.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {favorite.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{favorite.location}</span>
                          </div>
                        )}
                        {favorite.date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{favorite.date}</span>
                          </div>
                        )}
                        {favorite.price && (
                          <div className="font-medium text-gray-900">
                            {formatPrice(favorite.price, favorite.currency || 'RUB')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <a
                        href={getItemHref(favorite)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Перейти к элементу"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleRemove(favorite.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Удалить из избранного"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          
          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
