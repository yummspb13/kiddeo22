// src/components/chat/ReviewsManager.tsx
"use client"

import { useState } from "react"
import { 
  Star, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search,
  Reply,
  Flag,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"

interface Review {
  id: number
  listingId: number
  listingTitle: string
  userId: number
  userName: string
  userAvatar?: string
  rating: number
  title?: string
  content: string
  isPublic: boolean
  isModerated: boolean
  moderatorId?: number
  moderatedAt?: Date
  vendorReply?: string
  replyAt?: Date
  createdAt: Date
  helpfulCount: number
  reportCount: number
}

interface ReviewsManagerProps {
  reviews: Review[]
  onReplyToReview: (reviewId: number, reply: string) => void
  onModerateReview: (reviewId: number, action: 'approve' | 'reject' | 'hide') => void
  onMarkHelpful: (reviewId: number) => void
  onReportReview: (reviewId: number, reason: string) => void
}

const RATING_LABELS = {
  1: 'Ужасно',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично'
}

const RATING_COLORS = {
  1: 'text-red-600',
  2: 'text-orange-600',
  3: 'text-yellow-600',
  4: 'text-blue-600',
  5: 'text-green-600'
}

export default function ReviewsManager({
  reviews,
  onReplyToReview,
  onModerateReview,
  onMarkHelpful,
  onReportReview
}: ReviewsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = ratingFilter === 'ALL' || review.rating === ratingFilter
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'PENDING' && !review.isModerated) ||
      (statusFilter === 'APPROVED' && review.isModerated && review.isPublic) ||
      (statusFilter === 'REJECTED' && review.isModerated && !review.isPublic)
    return matchesSearch && matchesRating && matchesStatus
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleReply = () => {
    if (selectedReview && replyText.trim()) {
      onReplyToReview(selectedReview.id, replyText.trim())
      setShowReplyModal(false)
      setReplyText('')
      setSelectedReview(null)
    }
  }

  const openReplyModal = (review: Review) => {
    setSelectedReview(review)
    setShowReplyModal(true)
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }))

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление отзывами</h2>
          <p className="text-gray-600">Отвечайте на отзывы и управляйте репутацией</p>
        </div>
      </div>

      {/* Статистика отзывов */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Средняя оценка</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего отзывов</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Одобрено</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.isModerated && r.isPublic).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">На модерации</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => !r.isModerated).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Распределение оценок */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение оценок</h3>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-16">
                <span className="text-sm font-medium text-gray-600">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 ml-1" />
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right">
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по отзывам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Все оценки</option>
          {[5, 4, 3, 2, 1].map(rating => (
            <option key={rating} value={rating}>
              {rating} звезд
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Все статусы</option>
          <option value="PENDING">На модерации</option>
          <option value="APPROVED">Одобрено</option>
          <option value="REJECTED">Отклонено</option>
        </select>
      </div>

      {/* Список отзывов */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет отзывов</h3>
            <p className="text-gray-600">Отзывы появятся здесь после получения</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                {/* Аватар пользователя */}
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Содержимое отзыва */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{review.userName}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className={`ml-2 text-sm font-medium ${RATING_COLORS[review.rating as keyof typeof RATING_COLORS]}`}>
                          {RATING_LABELS[review.rating as keyof typeof RATING_LABELS]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!review.isModerated && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          На модерации
                        </span>
                      )}
                      {review.isModerated && review.isPublic && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Одобрено
                        </span>
                      )}
                      {review.isModerated && !review.isPublic && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Отклонено
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{review.listingTitle}</p>
                  
                  {review.title && (
                    <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  )}
                  
                  <p className="text-gray-700 mb-4">{review.content}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(review.createdAt)}</span>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => onMarkHelpful(review.id)}
                        className="flex items-center hover:text-blue-600"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        <span>{review.helpfulCount}</span>
                      </button>
                      <button
                        onClick={() => onReportReview(review.id, 'spam')}
                        className="flex items-center hover:text-red-600"
                      >
                        <Flag className="w-4 h-4 mr-1" />
                        <span>{review.reportCount}</span>
                      </button>
                    </div>
                  </div>

                  {/* Ответ вендора */}
                  {review.vendorReply && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-blue-900">Ответ вендора</span>
                        <span className="ml-2 text-xs text-blue-600">
                          {review.replyAt && formatDate(review.replyAt)}
                        </span>
                      </div>
                      <p className="text-blue-800">{review.vendorReply}</p>
                    </div>
                  )}

                  {/* Действия */}
                  <div className="mt-4 flex items-center space-x-2">
                    {!review.vendorReply && (
                      <button
                        onClick={() => openReplyModal(review)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Ответить
                      </button>
                    )}
                    
                    {!review.isModerated && (
                      <>
                        <button
                          onClick={() => onModerateReview(review.id, 'approve')}
                          className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Одобрить
                        </button>
                        <button
                          onClick={() => onModerateReview(review.id, 'reject')}
                          className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно ответа */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ответить на отзыв</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-900">{selectedReview.userName}</span>
                <div className="flex items-center ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{selectedReview.content}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваш ответ
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Напишите ответ на отзыв..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReplyModal(false)
                  setReplyText('')
                  setSelectedReview(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отправить ответ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
