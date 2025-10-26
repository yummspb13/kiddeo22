'use client'

import { useState, useEffect, useMemo } from 'react'
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
  endDate?: string
  createdAt: string
}

interface FavoritesManagerProps {
  onStatsUpdate?: () => void
}

export default function FavoritesManager({ onStatsUpdate }: FavoritesManagerProps) {
  const { user, loading: userLoading } = useUser()
  const { favorites, loading, removeFromFavorites } = useFavoritesSimple()
  const [filter, setFilter] = useState<'all' | 'events' | 'places' | 'services'>('all')
  
  // Мемоизируем favorites для предотвращения лишних перерендеров
  const memoizedFavorites = useMemo(() => favorites, [favorites.length, JSON.stringify(favorites.map(f => f.id))])
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFavorites, setTotalFavorites] = useState(0)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [paginatedFavorites, setPaginatedFavorites] = useState<Favorite[]>([])

  // Toast уведомления
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })


  // Эффект для пагинации избранного
  useEffect(() => {
    if (memoizedFavorites.length === 0) {
      setPaginatedFavorites([])
      setTotalFavorites(0)
      setTotalPages(1)
      return
    }

    const filteredFavorites = memoizedFavorites.filter(favorite => {
      if (filter === 'all') return true
      return favorite.itemType === filter
    })

    setTotalFavorites(filteredFavorites.length)
    setTotalPages(Math.ceil(filteredFavorites.length / 10))

    const startIndex = (currentPage - 1) * 10
    const endIndex = startIndex + 10
    setPaginatedFavorites(filteredFavorites.slice(startIndex, endIndex))
  }, [memoizedFavorites, filter, currentPage])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleRemove = (favoriteId: string, favoriteTitle: string) => {
    if (!user?.id) {
      showToast('Пользователь не авторизован', 'error')
      return
    }

    if (!confirm(`Вы уверены, что хотите удалить "${favoriteTitle}" из избранного?`)) {
      return
    }

    const success = removeFromFavorites(favoriteId)
    if (success) {
      showToast(`"${favoriteTitle}" удалено из избранного`)
      onStatsUpdate?.()
    } else {
      showToast('Произошла ошибка при удалении', 'error')
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
        // Для событий используем itemId как slug (он должен быть правильным slug из базы)
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        return dateString
      }
      
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatDateRange = (startDate: string, endDate?: string) => {
    try {
      const start = new Date(startDate)
      const end = endDate ? new Date(endDate) : null
      
      if (isNaN(start.getTime())) {
        return startDate
      }
      
      const startFormatted = start.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      const startTime = start.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      if (!end || isNaN(end.getTime())) {
        // Только одна дата
        return `${startFormatted} ${startTime}`
      }
      
      const endFormatted = end.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      const endTime = end.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      // Проверяем, одна ли дата
      if (startFormatted === endFormatted) {
        // Одна дата, разные времена
        return `${startFormatted} ${startTime}-${endTime}`
      } else {
        // Разные даты - используем формат "11.10.2025 - 30.10.2025 16:00"
        return `${startFormatted} - ${endFormatted} ${endTime}`
      }
    } catch {
      return startDate
    }
  }

  const isEventPast = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date < new Date()
    } catch {
      return false
    }
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
      {/* Мобильная версия заголовка */}
      <div className="block md:hidden">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Избранное</h1>
          <div className="text-sm text-gray-500">{totalFavorites} элементов</div>
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
      </div>

      {/* Десктопная версия заголовка */}
      <div className="hidden md:flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Избранное</h3>
          <div className="text-sm text-gray-500 mt-1">
            {totalFavorites} элементов
          </div>
        </div>
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
            <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {/* Мобильная версия элемента избранного */}
              <div className="block md:hidden">
                <div className="flex space-x-3">
                  {/* Столбец 1: Картинка */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {favorite.image ? (
                      <img
                        src={favorite.image}
                        alt={favorite.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        {getItemIcon(favorite.itemType)}
                      </div>
                    )}
                  </div>
                  
                  {/* Столбец 2: Основной контент */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Строка 1: Название */}
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {favorite.title}
                    </h4>
                    
                    {/* Строка 2: Адрес */}
                    {favorite.location && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>{favorite.location}</span>
                      </div>
                    )}
                    
                    {/* Строка 3: Даты мероприятия */}
                    {favorite.date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>{formatDateRange(favorite.date, favorite.endDate)}</span>
                      </div>
                    )}
                    
                    {/* Строка 4: Бейджик типа */}
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                      {getItemTypeLabel(favorite.itemType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Десктопная версия элемента избранного */}
              <div className="hidden md:block">
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
                        {favorite.endDate && isEventPast(favorite.endDate) && (
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                            Закончилось
                          </span>
                        )}
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
                            <span>{formatDateRange(favorite.date, favorite.endDate)}</span>
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
                        onClick={() => handleRemove(favorite.id, favorite.title)}
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

      {/* Toast уведомления */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="text-sm font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="flex-shrink-0 ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
