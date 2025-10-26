'use client'

import { useState, useEffect } from 'react'
import { Star, MessageCircle, Calendar, MapPin, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from '@/utils/formatTime'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  comment: string | null
  status: string
  likesCount: number
  dislikesCount: number
  createdAt: string
  event: {
    id: string
    title: string
    slug: string
    coverImage: string | null
    startDate: string
    venue: string
  }
}

interface ProfileReviewsProps {
  onStatsUpdate?: () => void
}

export default function ProfileReviews({ onStatsUpdate }: ProfileReviewsProps) {
  const [user, setUser] = useState<{ id: number; name: string | null; email: string | null; image: string | null } | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/simple-user')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          fetchReviews(data.user.id)
        }
      }
    } catch (error) {
      console.error('Error fetching user for reviews:', error)
    } finally {
      setUserLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchReviews(user.id)
    } else if (!userLoading) {
      setLoading(false)
    }
  }, [user?.id, userLoading])

  const fetchReviews = async (userId?: number, page: number = 1) => {
    const currentUserId = userId || user?.id
    if (!currentUserId) return

    try {
      const response = await fetch(`/api/profile/reviews?page=${page}&limit=10`, {
        headers: {
          'x-user-id': currentUserId.toString()
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setTotalPages(data.totalPages || 1)
        setTotalReviews(data.totalReviews || 0)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'MODERATION':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'HIDDEN':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Одобрен'
      case 'MODERATION':
        return 'На модерации'
      case 'REJECTED':
        return 'Отклонен'
      case 'HIDDEN':
        return 'Скрыт'
      default:
        return 'Неизвестно'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (userLoading || loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Пользователь не авторизован</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Мобильная версия заголовка */}
      <div className="block md:hidden">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Мои отзывы</h1>
          <p className="text-sm text-gray-600">Управляйте своими отзывами и оценками</p>
          <div className="text-sm text-gray-500">{totalReviews} отзывов</div>
        </div>
      </div>

      {/* Десктопная версия заголовка */}
      <div className="hidden md:flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои отзывы</h1>
          <p className="text-gray-600 mt-1">Управляйте своими отзывами и оценками</p>
        </div>
        <span className="text-sm text-gray-500">{totalReviews} отзывов</span>
      </div>

      {/* Статистика отзывов */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Статистика отзывов</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">{totalReviews}</div>
              <div className="text-xs md:text-sm text-gray-500">Всего отзывов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {reviews.filter(r => r.status === 'APPROVED').length}
              </div>
              <div className="text-xs md:text-sm text-gray-500">Опубликовано</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-600">
                {reviews.filter(r => r.status === 'MODERATION').length}
              </div>
              <div className="text-xs md:text-sm text-gray-500">На модерации</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600">
                {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
              </div>
              <div className="text-xs md:text-sm text-gray-500">Средняя оценка</div>
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>У вас пока нет отзывов</p>
          <p className="text-sm">Оставьте отзыв о посещенном событии</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {/* Мобильная версия отзыва */}
              <div className="block md:hidden">
                <div className="flex space-x-3">
                  {/* Столбец 1: Картинка */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {review.event.coverImage ? (
                      <Image
                        src={review.event.coverImage}
                        alt={review.event.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Столбец 2: Основной контент */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Строка 1: Название события */}
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {review.event.title}
                    </h4>
                    
                    {/* Строка 2: Место проведения */}
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" style={{ width: '12px', height: '12px' }} />
                      <span>{review.event.venue}</span>
                    </div>
                    
                    {/* Строка 3: Дата и время */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" style={{ width: '12px', height: '12px' }} />
                      <span>{new Date(review.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    
                    {/* Строка 4: Звездочки */}
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    
                    {/* Строка 5: Статус */}
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusText(review.status)}
                      </span>
                    </div>
                    
                    {/* Строка 6: Комментарий */}
                    {review.comment && (
                      <p className="text-gray-700 text-xs leading-relaxed">{review.comment}</p>
                    )}
                    
                    {/* Строка 7: Оценки */}
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        👍 {review.likesCount}
                      </span>
                      <span className="flex items-center">
                        👎 {review.dislikesCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Десктопная версия отзыва */}
              <div className="hidden md:block">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {review.event.coverImage ? (
                      <Image
                        src={review.event.coverImage}
                        alt={review.event.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{review.event.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatRelativeTime(review.event.startDate)}</span>
                          <MapPin className="w-4 h-4 ml-2" />
                          <span>{review.event.venue}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {getStatusText(review.status)}
                        </span>
                        <Link
                          href={`/event/${review.event.slug}`}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Посмотреть событие"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{review.comment}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👍 {review.likesCount}</span>
                      <span>👎 {review.dislikesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => {
              const newPage = currentPage - 1
              setCurrentPage(newPage)
              fetchReviews(user?.id, newPage)
            }}
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
                  onClick={() => {
                    setCurrentPage(page)
                    fetchReviews(user?.id, page)
                  }}
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
            onClick={() => {
              const newPage = currentPage + 1
              setCurrentPage(newPage)
              fetchReviews(user?.id, newPage)
            }}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  )
}
