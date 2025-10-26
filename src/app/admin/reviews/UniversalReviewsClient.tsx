'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Clock, Star, User, MapPin, MessageSquare, Image as ImageIcon, Calendar, Building } from 'lucide-react'

interface UniversalReview {
  id: string
  type: 'event' | 'venue'
  rating: number
  comment: string | null
  photos: string | null
  status: string
  createdAt: string
  user: {
    id: number
    name: string | null
    email: string
    image: string | null
  }
  entity: {
    id: number
    name: string
    slug?: string
    address?: string | null
    startDate?: string
    endDate?: string
  }
  reactions: Array<{
    id: string
    type: string
    user: {
      id: number
      name: string | null
    }
  }>
  replies: Array<{
    id: string
    message: string
    createdAt: string
    user: {
      id: number
      name: string | null
      image: string | null
    }
  }>
}

interface UniversalReviewsClientProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default function UniversalReviewsClient({ searchParams }: UniversalReviewsClientProps) {
  const [reviews, setReviews] = useState<UniversalReview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<UniversalReview | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [moderatorNotes, setModeratorNotes] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('MODERATION')
  const [typeFilter, setTypeFilter] = useState<'all' | 'event' | 'venue'>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchReviews()
  }, [statusFilter, typeFilter, pagination.page])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        type: typeFilter,
        key: 'kidsreview2025'
      })
      
      const response = await fetch(`/api/admin/universal-reviews?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching reviews:', response.status)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (reviewId: string, action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(reviewId)
    try {
      const response = await fetch('/api/admin/universal-reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewId,
          status: action,
          moderatorNotes: moderatorNotes || null
        })
      })

      if (response.ok) {
        await fetchReviews()
        setShowDetails(false)
        setSelectedReview(null)
        setModeratorNotes('')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error moderating review:', error)
      alert('Ошибка при модерации отзыва')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MODERATION':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'MODERATION':
        return 'На модерации'
      case 'APPROVED':
        return 'Одобрен'
      case 'REJECTED':
        return 'Отклонен'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MODERATION':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    return type === 'event' ? <Calendar className="w-4 h-4" /> : <Building className="w-4 h-4" />
  }

  const getTypeText = (type: string) => {
    return type === 'event' ? 'Событие' : 'Место'
  }

  const getTypeColor = (type: string) => {
    return type === 'event' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4">
          {/* Фильтр по статусу */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Статус:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="MODERATION">На модерации</option>
              <option value="APPROVED">Одобренные</option>
              <option value="REJECTED">Отклоненные</option>
              <option value="ALL">Все</option>
            </select>
          </div>

          {/* Фильтр по типу */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Тип:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'event' | 'venue')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">Все</option>
              <option value="event">События</option>
              <option value="venue">Места</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список отзывов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Отзывы ({pagination.total})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет отзывов</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'MODERATION' ? 'Нет отзывов на модерации' : 'Нет отзывов с выбранным статусом'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeIcon(review.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(review.type)}`}>
                        {getTypeText(review.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusIcon(review.status)}
                        <span className="ml-1">{getStatusText(review.status)}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.rating}/5</span>
                    </div>

                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      {review.entity.name}
                    </h4>

                    {review.comment && (
                      <p className="text-gray-700 mb-2 line-clamp-2">{review.comment}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{review.user.name || review.user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                      {review.entity.address && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{review.entity.address}</span>
                        </div>
                      )}
                    </div>

                    {review.photos && (
                      <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                        <ImageIcon className="w-4 h-4" />
                        <span>Есть фото</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedReview(review)
                        setShowDetails(true)
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Пагинация */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями */}
      {showDetails && selectedReview && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Детали отзыва</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(selectedReview.type)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedReview.type)}`}>
                    {getTypeText(selectedReview.type)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReview.status)}`}>
                    {getStatusIcon(selectedReview.status)}
                    <span className="ml-1">{getStatusText(selectedReview.status)}</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">{selectedReview.entity.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{selectedReview.rating}/5</span>
                  </div>
                </div>

                {selectedReview.comment && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Комментарий:</h5>
                    <p className="text-gray-700">{selectedReview.comment}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Пользователь:</span>
                    <p className="text-gray-700">{selectedReview.user.name || selectedReview.user.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Дата:</span>
                    <p className="text-gray-700">{formatDate(selectedReview.createdAt)}</p>
                  </div>
                </div>

                {selectedReview.photos && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Фотографии:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {JSON.parse(selectedReview.photos).map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заметки модератора:
                  </label>
                  <textarea
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Добавьте заметки для модерации..."
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => handleModeration(selectedReview.id, 'APPROVED')}
                    disabled={actionLoading === selectedReview.id}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedReview.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Одобрить
                  </button>
                  <button
                    onClick={() => handleModeration(selectedReview.id, 'REJECTED')}
                    disabled={actionLoading === selectedReview.id}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedReview.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
