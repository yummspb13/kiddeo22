'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Trash2 } from 'lucide-react'
import ReviewReplies from './ReviewReplies'
import ConfirmModal from './ConfirmModal'
import { formatRelativeTime } from '@/utils/formatTime'
import { emitActivityEvent } from '@/hooks/useNotifications'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'

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

interface SimpleEventReviewsProps {
  eventId: string
}

export default function SimpleEventReviews({ eventId }: SimpleEventReviewsProps) {
  const { openLoginModal } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<{ id: number; name: string | null; email: string | null; image: string | null } | null>(null)
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null) // ID отзыва для которого показана форма
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    reviewId: string | null
    type: 'delete_review' | 'delete_reply'
  }>({
    isOpen: false,
    reviewId: null,
    type: 'delete_review'
  })
  const { showSuccess, showError } = useNotifications()

  useEffect(() => {
    fetchReviews()
    fetchUser()
  }, [eventId])

  const fetchUser = async () => {
    try {
      console.log('🔍 Fetching current user')
      const response = await fetch('/api/simple-user')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ User data:', data)
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      console.log('🔍 Fetching reviews for event:', eventId)
      const response = await fetch(`/api/simple-reviews?eventId=${eventId}&status=APPROVED&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      console.log('🔍 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Reviews data:', data)
        setReviews(data.reviews)
      } else {
        console.error('❌ Error response:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId || rating === 0) return

    if (!user?.id) {
      alert('Необходимо войти в систему для оставления отзыва')
      return
    }

    console.log('🔍 Submitting review:', { eventId, rating, comment, userId: user.id })
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/simple-create-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userId: user.id, // Реальный пользователь
          rating,
          comment: comment.trim() || null,
        }),
      })

      console.log('🔍 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Review created:', data)
        if (data.success) {
          setRating(0)
          setComment('')
          setShowForm(false)
          // Принудительно обновляем отзывы
          await fetchReviews()
          // Дополнительное обновление через небольшую задержку
          setTimeout(async () => {
            await fetchReviews()
          }, 500)
          
          // Отправляем уведомление о создании отзыва
          emitActivityEvent('review_created', {
            reviewId: data.review.id,
            eventTitle: 'Мероприятие', // Можно получить из props
            rating: rating
          })
          
          showSuccess('Отзыв добавлен!', 'Ваш отзыв успешно опубликован')
        } else {
          showError('Ошибка', data.error || 'Ошибка при создании отзыва')
        }
      } else {
        const error = await response.json()
        console.error('❌ Error response:', error)
        showError('Ошибка', error.error || 'Ошибка при отправке отзыва')
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error)
      showError('Ошибка', 'Ошибка при отправке отзыва')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = (reviewId: string) => {
    setConfirmModal({
      isOpen: true,
      reviewId,
      type: 'delete_review'
    })
  }

  const confirmDeleteReview = async () => {
    if (!confirmModal.reviewId) return

    try {
      const response = await fetch(`/api/simple-reviews/${confirmModal.reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        showSuccess('Отзыв удален', 'Отзыв успешно удален')
        await fetchReviews()
      } else {
        const error = await response.json()
        showError('Ошибка', error.error || 'Ошибка при удалении отзыва')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      showError('Ошибка', 'Ошибка при удалении отзыва')
    }
  }

  const handleReaction = async (reviewId: string, type: 'LIKE' | 'DISLIKE') => {
    if (!user?.id) {
      showError('Ошибка', 'Необходимо войти в систему для оценки отзывов')
      return
    }

    console.log('🔍 Handling reaction:', { reviewId, type, userId: user.id })
    
    try {
      const response = await fetch('/api/simple-reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          userId: user.id, // Реальный пользователь
          type
        })
      })

      console.log('🔍 Reaction response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Reaction processed:', data)
        if (data.success) {
          await fetchReviews()
          
          // Показываем уведомление об успехе
          const actionText = type === 'LIKE' ? 'лайк' : 'дизлайк'
          console.log('🎉 Showing success notification for reaction')
          console.log('🎉 showSuccess function:', typeof showSuccess)
          showSuccess('Реакция добавлена!', `Вы поставили ${actionText} на отзыв`)
        } else {
          console.log('❌ Reaction was not successful')
          showError('Ошибка', 'Не удалось поставить реакцию')
        }
      } else {
        const error = await response.json()
        console.error('❌ Reaction error:', error)
        showError('Ошибка', error.error || 'Ошибка при добавлении реакции')
      }
    } catch (error) {
      console.error('❌ Error adding reaction:', error)
      showError('Ошибка', 'Ошибка при добавлении реакции')
    }
  }


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
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
    <div className="space-y-6 mx-2">
      {/* Заголовок и кнопка добавления отзыва */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex-shrink-0">
          Отзывы ({reviews.length})
        </h3>
        
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-3 py-2 rounded-full hover:bg-blue-700 flex items-center space-x-1 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Написать</span>
          </button>
        ) : (
          <div className="text-sm text-gray-500 text-right flex-shrink-0 min-w-0">
            <div className="block">
              <div>
                <button 
                  onClick={openLoginModal}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Войдите
                </button>
                <span className="text-gray-500">, чтобы</span>
              </div>
              <div className="text-gray-500">
                оставить отзыв
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Форма добавления отзыва */}
      {showForm && user && (
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
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
            <div className="flex justify-end space-x-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Отправка...' : 'Отправить'}
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
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              {/* Мобильная версия - вертикальная компоновка */}
              <div className="block sm:hidden">
                <div className="flex items-start space-x-3 mb-2">
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
                    <p className="text-sm text-gray-500 mb-3">
                      {formatRelativeTime(review.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Десктопная версия - горизонтальная компоновка */}
              <div className="hidden sm:block">
                <div className="flex items-start space-x-3 mb-2">
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
                      {formatRelativeTime(review.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-4 mx-2">{review.comment}</p>
              )}

              {/* Мобильная версия - кнопки внизу */}
              <div className="block sm:hidden">
                <div className="flex items-center justify-between mb-2">
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
                  
                  {/* Кнопки действий */}
                  <div className="flex items-center gap-2">
                    {user?.id && (
                      <button
                        onClick={() => {
                          setShowReplyForm(showReplyForm === review.id ? null : review.id)
                        }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden xs:inline">{showReplyForm === review.id ? 'Отменить' : 'Ответить'}</span>
                      </button>
                    )}
                    
                    {user?.id && review.user.id === parseInt(user.id.toString()) && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Десктопная версия - кнопки справа */}
              <div className="hidden sm:flex items-center justify-between">
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
                
                {/* Кнопки справа */}
                <div className="flex items-center gap-2">
                  {/* Кнопка "Ответить" */}
                  {user?.id && (
                    <button
                      onClick={() => {
                        setShowReplyForm(showReplyForm === review.id ? null : review.id)
                      }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {showReplyForm === review.id ? 'Отменить' : 'Ответить'}
                    </button>
                  )}
                  
                  {/* Кнопка "Удалить" */}
                  {user?.id && review.user.id === parseInt(user.id.toString()) && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </button>
                  )}
                </div>
              </div>

              {/* Форма ответа */}
              {showReplyForm === review.id && user?.id && (
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const message = formData.get('replyMessage') as string
                    
                    if (!message.trim()) return
                    
                    try {
                      const response = await fetch(`/api/reviews/${review.id}/replies`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          message: message.trim(),
                        }),
                      })

                      if (response.ok) {
                        const data = await response.json()
                        if (data.success) {
                          showSuccess('Ответ добавлен!', 'Ваш ответ успешно опубликован')
                          setShowReplyForm(null)
                          await fetchReviews()
                        } else {
                          showError('Ошибка', data.error || 'Ошибка при создании ответа')
                        }
                      } else {
                        const error = await response.json()
                        showError('Ошибка', error.error || 'Ошибка при отправке ответа')
                      }
                    } catch (error) {
                      console.error('Error submitting reply:', error)
                      showError('Ошибка', 'Ошибка при отправке ответа')
                    }
                  }}>
                    <textarea
                      name="replyMessage"
                      rows={2}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                      placeholder="Напишите ответ..."
                      required
                    />
                    <div className="flex justify-end mt-1 space-x-1">
                      <button
                        type="button"
                        onClick={() => setShowReplyForm(null)}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
                      >
                        Отправить
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Компонент ответов */}
              <ReviewReplies
                reviewId={review.id}
                replies={review.replies || []}
                currentUserId={user?.id}
                onReplyAdded={fetchReviews}
                showReplyButton={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'delete_review'}
        onClose={() => setConfirmModal({ isOpen: false, reviewId: null, type: 'delete_review' })}
        onConfirm={confirmDeleteReview}
        title="Подтвердите действие"
        message="Уверены, что хотели бы удалить отзыв?"
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />
    </div>
  )
}
