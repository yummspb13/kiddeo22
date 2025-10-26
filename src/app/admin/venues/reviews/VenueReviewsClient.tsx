'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Clock, Star, User, MapPin, MessageSquare, Image as ImageIcon } from 'lucide-react'

interface VenueReview {
  id: string
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
  venue: {
    id: number
    name: string
    slug: string
    address: string | null
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

interface VenueReviewsClientProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default function VenueReviewsClient({ searchParams }: VenueReviewsClientProps) {
  const [reviews, setReviews] = useState<VenueReview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<VenueReview | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [moderatorNotes, setModeratorNotes] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('MODERATION')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchReviews()
  }, [statusFilter, pagination.page])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/venue-reviews?status=${statusFilter}&page=${pagination.page}&limit=${pagination.limit}&key=kidsreview2025`)
      
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
      const response = await fetch('/api/admin/venue-reviews', {
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
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Загрузка отзывов...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="MODERATION">На модерации</option>
          <option value="APPROVED">Одобренные</option>
          <option value="REJECTED">Отклоненные</option>
        </select>
        
        <div className="text-sm text-gray-600">
          Всего: {pagination.total} | Страница: {pagination.page} из {pagination.pages}
        </div>
      </div>

      {/* Список отзывов */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Отзывов не найдено
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(review.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusText(review.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {review.user.name || 'Анонимный пользователь'}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({review.user.email})
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {review.venue.name}
                      </span>
                      {review.venue.address && (
                        <span className="text-sm text-gray-500">
                          • {review.venue.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Комментарий:</span>
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {review.photos && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Фотографии:</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {JSON.parse(review.photos).map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Лайки: {review.reactions.filter(r => r.type === 'LIKE').length}</span>
                    <span>Дизлайки: {review.reactions.filter(r => r.type === 'DISLIKE').length}</span>
                    <span>Ответы: {review.replies.length}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedReview(review)
                      setShowDetails(true)
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Подробнее</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <span className="text-sm text-gray-600">
            {pagination.page} из {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вперед
          </button>
        </div>
      )}

      {/* Модальное окно деталей */}
      {showDetails && selectedReview && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Детали отзыва</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(selectedReview.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReview.status)}`}>
                  {getStatusText(selectedReview.status)}
                </span>
                <div className="flex items-center space-x-1">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Пользователь:</h4>
                <p className="text-sm text-gray-600">
                  {selectedReview.user.name || 'Анонимный пользователь'} ({selectedReview.user.email})
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Место:</h4>
                <p className="text-sm text-gray-600">
                  {selectedReview.venue.name}
                  {selectedReview.venue.address && ` • ${selectedReview.venue.address}`}
                </p>
              </div>

              {selectedReview.comment && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Комментарий:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedReview.comment}
                  </p>
                </div>
              )}

              {selectedReview.photos && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Фотографии:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {JSON.parse(selectedReview.photos).map((photo: string, index: number) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Заметки модератора:</h4>
                <textarea
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Добавьте заметки для модерации..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleModeration(selectedReview.id, 'APPROVED')}
                  disabled={actionLoading === selectedReview.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Одобрить</span>
                </button>
                <button
                  onClick={() => handleModeration(selectedReview.id, 'REJECTED')}
                  disabled={actionLoading === selectedReview.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Отклонить</span>
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
