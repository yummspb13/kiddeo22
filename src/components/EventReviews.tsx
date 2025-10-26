'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface Review {
  id: string
  rating: number
  comment: string | null
  status: string
  likesCount: number
  dislikesCount: number
  createdAt: string
  user: {
    id: number
    name: string | null
    image: string | null
  }
  reactions: Array<{
    id: string
    type: 'LIKE' | 'DISLIKE'
    user: {
      id: number
      name: string | null
    }
  }>
}

interface EventReviewsProps {
  eventId: string
}

export default function EventReviews({ eventId }: EventReviewsProps) {
  const { user } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [eventId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/simple-reviews?eventId=${eventId}&status=APPROVED`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !eventId || rating === 0) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/simple-create-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userId: user.id,
          rating,
          comment: comment.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRating(0)
          setComment('')
          setShowForm(false)
          await fetchReviews()
          addToast({
            type: 'success',
            title: 'Отзыв добавлен!',
            message: 'Отзыв успешно добавлен!',
            duration: 4000
          })
        } else {
          addToast({
            type: 'error',
            title: 'Ошибка при создании отзыва',
            message: data.error || 'Ошибка при создании отзыва',
            duration: 6000
          })
        }
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          title: 'Ошибка при отправке отзыва',
          message: error.error || 'Ошибка при отправке отзыва',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при отправке отзыва',
        message: 'Произошла ошибка при отправке отзыва. Попробуйте еще раз.',
        duration: 6000
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReaction = async (reviewId: string, type: 'LIKE' | 'DISLIKE') => {
    if (!user?.id) {
      addToast({
        type: 'warning',
        title: 'Необходима авторизация',
        message: 'Необходимо войти в систему для оценки отзывов',
        duration: 5000
      })
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        await fetchReviews()
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавления отзыва */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Отзывы ({reviews.length})
        </h3>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Написать отзыв</span>
          </button>
        )}
      </div>

      {/* Форма добавления отзыва */}
      {showForm && user && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Ваш отзыв</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Оценка
              </label>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className={`w-8 h-8 ${
                      i < rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий (необязательно)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Поделитесь своими впечатлениями..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Отправка...' : 'Отправить отзыв'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список отзывов */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Пока нет отзывов</p>
          <p className="text-sm">Станьте первым, кто оставит отзыв!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.user.image ? (
                    <img
                      src={review.user.image}
                      alt={review.user.name || 'Пользователь'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {review.user.name || 'Пользователь'}
                    </span>
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-4">{review.comment}</p>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleReaction(review.id, 'LIKE')}
                  className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{review.likesCount}</span>
                </button>
                <button
                  onClick={() => handleReaction(review.id, 'DISLIKE')}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm">{review.dislikesCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
