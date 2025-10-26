'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Trash2 } from 'lucide-react'
import ReviewReplies from './ReviewReplies'
import ConfirmModal from './ConfirmModal'
import { formatRelativeTime } from '@/utils/formatTime'
import { emitActivityEvent } from '@/hooks/useNotifications'
import { useNotifications } from '@/hooks/useNotifications'

interface Review {
  id: string
  rating: number
  comment: string | null
  photos: string | null
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

interface SimpleVenueReviewsProps {
  venueId: number
}

export default function SimpleVenueReviews({ venueId }: SimpleVenueReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [user, setUser] = useState<{ id: number; name: string | null; email: string | null; image: string | null } | null>(null)
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [currentReviewPhotos, setCurrentReviewPhotos] = useState<string[]>([])
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null) // ID отзыва для которого показана форма
  const [replyMessage, setReplyMessage] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
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
  }, [venueId])

  useEffect(() => {
    if (user?.id && reviews.length > 0) {
      const userReview = reviews.find((review: any) => review.userId === user.id)
      setHasUserReviewed(!!userReview)
    }
  }, [user, reviews])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 10) {
      showError('Можно загрузить максимум 10 фотографий')
      return
    }
    
    const newPhotos = [...photos, ...files]
    setPhotos(newPhotos)
    
    // Создаем превью для новых фотографий
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPhotoPreviews([...photoPreviews, ...newPreviews])
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)
    
    // Освобождаем память от URL объекта
    URL.revokeObjectURL(photoPreviews[index])
    
    setPhotos(newPhotos)
    setPhotoPreviews(newPreviews)
  }

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
      console.log('🔍 Fetching reviews for venue:', venueId)
      const response = await fetch(`/api/simple-venue-reviews?venueId=${venueId}&_t=${Date.now()}`, {
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
        
        // Фильтруем отзывы: показываем только APPROVED для публики, но все для владельца
        const filteredReviews = data.reviews.filter((review: any) => {
          if (review.status === 'APPROVED') return true
          if (user?.id && review.userId === user.id) return true // Показываем свои отзывы независимо от статуса
          return false
        })
        
        setReviews(filteredReviews)
        
        // Проверяем, оставил ли текущий пользователь отзыв
        if (user?.id) {
          const userReview = data.reviews.find((review: any) => review.userId === user.id)
          setHasUserReviewed(!!userReview)
        }
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
    if (!user?.id || !venueId || rating === 0) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('venueId', venueId.toString())
      formData.append('userId', user.id.toString())
      formData.append('rating', rating.toString())
      formData.append('comment', comment.trim() || '')
      
      // Добавляем фотографии
      photos.forEach((photo, index) => {
        formData.append(`photos`, photo)
      })

      const response = await fetch('/api/simple-create-venue-review', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRating(0)
          setComment('')
          setPhotos([])
          setPhotoPreviews([])
          setShowForm(false)
          await fetchReviews()
          showSuccess('Отзыв успешно добавлен!')
          emitActivityEvent('review_created', { venueId, rating })
        } else {
          showError(data.error || 'Ошибка при создании отзыва')
        }
      } else {
        const error = await response.json()
        if (error.error === 'You have already reviewed this venue') {
          showError('Вы уже оставили отзыв на это место')
        } else {
          showError(error.error || 'Ошибка при отправке отзыва')
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      showError('Ошибка при отправке отзыва')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReaction = async (reviewId: string, type: 'LIKE' | 'DISLIKE') => {
    if (!user?.id) {
      showError('Необходимо войти в систему для оценки отзывов')
      return
    }

    try {
      const response = await fetch(`/api/venue-reviews/${reviewId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        await fetchReviews()
        emitActivityEvent('review_reaction', { reviewId, type })
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/venue-reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      })

      if (response.ok) {
        await fetchReviews()
        showSuccess('Отзыв удален')
        emitActivityEvent('review_deleted', { reviewId })
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      showError('Ошибка при удалении отзыва')
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/venue-review-replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id
        }
      })

      if (response.ok) {
        await fetchReviews()
        showSuccess('Ответ удален')
        emitActivityEvent('review_reply_deleted', { replyId })
      }
    } catch (error) {
      console.error('Error deleting reply:', error)
      showError('Ошибка при удалении ответа')
    }
  }

  const handleSubmitReply = async (reviewId: string) => {
    if (!user?.id || !replyMessage.trim()) return

    setSubmittingReply(true)
    try {
      const response = await fetch('/api/venue-review-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          reviewId,
          message: replyMessage.trim()
        })
      })

      if (response.ok) {
        setReplyMessage('')
        setShowReplyForm(null)
        await fetchReviews()
        showSuccess('Ответ добавлен!')
        emitActivityEvent('reply_created', { reviewId })
      } else {
        const error = await response.json()
        showError(error.error || 'Ошибка при добавлении ответа')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      showError('Ошибка при добавлении ответа')
    } finally {
      setSubmittingReply(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }))

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-unbounded">Отзывы</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-lg font-bold text-gray-900">{averageRating}</span>
              <span className="text-gray-500">({reviews.length} отзывов)</span>
            </div>
          </div>
        </div>
                    {user && !hasUserReviewed && (
                      <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded"
                      >
                        {showForm ? 'Отмена' : 'Написать отзыв'}
                      </button>
                    )}
        {user && hasUserReviewed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-unbounded">✅ Вы уже оставили отзыв на это место</p>
          </div>
        )}
      </div>

      {/* Форма добавления отзыва */}
      {showForm && user && !hasUserReviewed && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-unbounded">Ваш отзыв</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">Комментарий</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поделитесь своими впечатлениями..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">Фотографии (до 10 штук)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {photoPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300 font-unbounded"
                >
                  {submitting ? 'Отправка...' : 'Отправить отзыв'}
                </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-unbounded"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Статистика отзывов */}
      {reviews.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-unbounded">Распределение оценок</h3>
              <div className="space-y-2">
                {ratingDistribution.map(({ star, count, percentage }) => (
                  <div key={star} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 w-8">{star}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Список отзывов */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Пока нет отзывов</p>
            <p className="text-gray-400">Станьте первым, кто оставит отзыв!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {review.user.image ? (
                    <img
                      src={review.user.image}
                      alt={review.user.name || 'Пользователь'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-violet-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-bold text-gray-900 font-unbounded">
                      {review.user.name || 'Анонимный пользователь'}
                    </span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-unbounded">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mb-3 leading-relaxed font-unbounded">{review.comment}</p>
                  )}
                  {user?.id === review.userId && review.status === 'MODERATION' && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm font-unbounded">⏳ Ваш отзыв отправлен на модерацию</p>
                    </div>
                  )}
                  {review.photos && (
                    <div className="mb-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {JSON.parse(review.photos).map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              const photos = JSON.parse(review.photos)
                              const photoIndex = photos.indexOf(photo)
                              setCurrentReviewPhotos(photos)
                              setCurrentPhotoIndex(photoIndex)
                              setSelectedPhoto(photo)
                              setShowPhotoModal(true)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleReaction(review.id, 'LIKE')}
                      className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{review.likesCount}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(review.id, 'DISLIKE')}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm">{review.dislikesCount}</span>
                    </button>
                    {user?.id === review.userId && (
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, reviewId: review.id, type: 'delete_review' })}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Удалить</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Ответы на отзыв */}
                  {review.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-gray-900 text-sm">
                              {reply.user.name || 'Администратор'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(reply.createdAt)}
                            </span>
                            {user?.id === reply.user.id && (
                              <button
                                onClick={() => setConfirmModal({ isOpen: true, reviewId: reply.id, type: 'delete_reply' })}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Кнопка "Ответить" и форма ответа */}
                  {user && (
                    <div className="mt-4">
                      {showReplyForm === review.id ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Напишите ответ на отзыв..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                          <div className="flex space-x-2 mt-3">
                            <button
                              onClick={() => handleSubmitReply(review.id)}
                              disabled={submittingReply || !replyMessage.trim()}
                              className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-unbounded transition-colors"
                            >
                              {submittingReply ? 'Отправка...' : 'Отправить'}
                            </button>
                            <button
                              onClick={() => {
                                setShowReplyForm(null)
                                setReplyMessage('')
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-unbounded transition-colors"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowReplyForm(review.id)}
                          className="text-violet-600 hover:text-violet-700 text-sm font-unbounded transition-colors"
                        >
                          Ответить
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно подтверждения */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, reviewId: null, type: 'delete_review' })}
        onConfirm={() => {
          if (confirmModal.type === 'delete_review' && confirmModal.reviewId) {
            handleDeleteReview(confirmModal.reviewId)
          } else if (confirmModal.type === 'delete_reply' && confirmModal.reviewId) {
            handleDeleteReply(confirmModal.reviewId)
          }
          setConfirmModal({ isOpen: false, reviewId: null, type: 'delete_review' })
        }}
        title="Подтверждение удаления"
        message={
          confirmModal.type === 'delete_review'
            ? 'Вы уверены, что хотите удалить этот отзыв?'
            : 'Вы уверены, что хотите удалить этот ответ?'
        }
      />

      {/* Модальное окно для просмотра фотографий */}
      {showPhotoModal && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors z-10"
            >
              ✕
            </button>
            
            {/* Стрелка влево */}
            {currentReviewPhotos.length > 1 && (
              <button
                onClick={() => {
                  const prevIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : currentReviewPhotos.length - 1
                  setCurrentPhotoIndex(prevIndex)
                  setSelectedPhoto(currentReviewPhotos[prevIndex])
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors z-10"
              >
                ‹
              </button>
            )}
            
            {/* Стрелка вправо */}
            {currentReviewPhotos.length > 1 && (
              <button
                onClick={() => {
                  const nextIndex = currentPhotoIndex < currentReviewPhotos.length - 1 ? currentPhotoIndex + 1 : 0
                  setCurrentPhotoIndex(nextIndex)
                  setSelectedPhoto(currentReviewPhotos[nextIndex])
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors z-10"
              >
                ›
              </button>
            )}
            
            {/* Фотография */}
            <img
              src={selectedPhoto}
              alt="Review photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Счетчик фотографий */}
            {currentReviewPhotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                {currentPhotoIndex + 1} / {currentReviewPhotos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
