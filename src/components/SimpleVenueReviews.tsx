'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Trash2, Edit3, CheckCircle } from 'lucide-react'
import ReviewReplies from './ReviewReplies'
import ConfirmModal from './ConfirmModal'
import { formatRelativeTime } from '@/utils/formatTime'
import { emitActivityEvent } from '@/hooks/useNotifications'
import { useToast } from '@/contexts/ToastContext'

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
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submittingReply, setSubmittingReply] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    reviewId: null as string | null,
    type: 'delete_review' as 'delete_review'
  })
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [currentReviewPhotos, setCurrentReviewPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  const { addToast } = useToast()

  useEffect(() => {
    fetchReviews()
    fetchUser()
  }, [venueId])

  useEffect(() => {
    console.log('🔍 Checking user review status:', {
      userId: user?.id,
      userType: typeof user?.id,
      reviewsCount: reviews.length,
      reviews: reviews.map(r => ({ id: r.id, userId: r.user.id, userType: typeof r.user.id }))
    })
    
    if (user?.id && reviews.length > 0) {
      const userReview = reviews.find((review: any) => 
        parseInt(review.user.id) === parseInt(user.id.toString())
      )
      console.log('🔍 User review found:', userReview)
      setHasUserReviewed(!!userReview)
    } else {
      setHasUserReviewed(false)
    }
  }, [user, reviews])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/simple-user')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/simple-reviews?venueId=${venueId}&status=ALL`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Raw reviews data:', data.reviews)
        
        // Фильтруем отзывы: показываем только APPROVED для публики, но все для владельца
        const filteredReviews = data.reviews.filter((review: any) => {
          if (review.status === 'APPROVED') return true
          if (user?.id && parseInt(review.user.id) === parseInt(user.id)) return true // Показываем свои отзывы независимо от статуса
          return false
        })
        
        // Сортируем отзывы: сначала отзыв текущего пользователя, затем остальные по дате (новые сверху)
        const sortedReviews = filteredReviews.sort((a: any, b: any) => {
          console.log('🔍 Sorting reviews:', {
            userA: a.user.id,
            userB: b.user.id,
            currentUser: user?.id,
            userAType: typeof a.user.id,
            userBType: typeof b.user.id,
            currentUserType: typeof user?.id
          })
          
          // Если есть пользователь, его отзыв всегда первый
        if (user?.id) {
            if (parseInt(a.user.id) === parseInt(user.id) && parseInt(b.user.id) !== parseInt(user.id)) return -1
            if (parseInt(a.user.id) !== parseInt(user.id) && parseInt(b.user.id) === parseInt(user.id)) return 1
          }
          // Остальные сортируем по дате (новые сверху)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setReviews(sortedReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !venueId || rating === 0) return

    setSubmitting(true)
    try {
      if (isEditing && editingReviewId) {
        // Редактирование отзыва
        let uploadedPhotos: string[] = []
        
        // Загружаем новые фото если есть
        if (photos.length > 0) {
          for (const photo of photos) {
            const formData = new FormData()
            formData.append('file', photo)
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              uploadedPhotos.push(uploadData.url)
            }
          }
        }
        
        // Объединяем существующие фото с новыми
        const allPhotos = [...existingPhotos, ...uploadedPhotos]
        
        const response = await fetch(`/api/simple-reviews/${editingReviewId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating: rating,
            comment: comment.trim() || null,
            photos: allPhotos.length > 0 ? JSON.stringify(allPhotos) : null,
          }),
      })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setRating(0)
            setComment('')
            setPhotos([])
            setPhotoPreviews([])
            setExistingPhotos([])
            setShowForm(false)
            setIsEditing(false)
            setEditingReviewId(null)
            await fetchReviews()
            addToast({
              type: 'success',
              title: 'Отзыв обновлен!',
              message: 'Отзыв успешно обновлен!',
              duration: 4000
            })
            emitActivityEvent('review_updated', { venueId, rating })
          } else {
            addToast({
              type: 'error',
              title: 'Ошибка при обновлении отзыва',
              message: data.error || 'Ошибка при обновлении отзыва',
              duration: 6000
            })
          }
        } else {
          const error = await response.json().catch(() => ({}))
          addToast({
            type: 'error',
            title: 'Ошибка при обновлении отзыва',
            message: error.error || 'Ошибка при обновлении отзыва',
            duration: 6000
          })
        }
      } else {
        // Создание нового отзыва
        let uploadedPhotos: string[] = []
        
        // Загружаем фото если есть
        if (photos.length > 0) {
          for (const photo of photos) {
            const formData = new FormData()
            formData.append('file', photo)
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              uploadedPhotos.push(uploadData.url)
            }
          }
        }
        
        const response = await fetch('/api/simple-create-review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            venueId: venueId,
            userId: user.id,
            rating: rating,
            comment: comment.trim() || null,
            photos: uploadedPhotos.length > 0 ? JSON.stringify(uploadedPhotos) : null,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setRating(0)
            setComment('')
            setPhotos([])
            setPhotoPreviews([])
            setExistingPhotos([])
            setShowForm(false)
            setIsEditing(false)
            setEditingReviewId(null)
            await fetchReviews()
            addToast({
              type: 'success',
              title: 'Отзыв добавлен!',
              message: 'Отзыв успешно добавлен!',
              duration: 4000
            })
            emitActivityEvent('review_created', { venueId, rating })
          } else {
            addToast({
              type: 'error',
              title: 'Ошибка при создании отзыва',
              message: data.error || 'Ошибка при создании отзыва',
              duration: 6000
            })
          }
        } else {
          const error = await response.json().catch(() => ({}))
          addToast({
            type: 'error',
            title: 'Ошибка при отправке отзыва',
            message: error.error || 'Ошибка при отправке отзыва',
            duration: 6000
          })
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при отправке отзыва',
        message: 'Ошибка при отправке отзыва',
        duration: 6000
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setRating(review.rating)
    setComment(review.comment || '')
    
    // Загружаем существующие фото если есть
    if (review.photos) {
      try {
        const parsedPhotos = JSON.parse(review.photos)
        setExistingPhotos(parsedPhotos)
        setPhotoPreviews(parsedPhotos)
        setPhotos([]) // Очищаем файлы, так как это URL, а не файлы
      } catch (error) {
        console.error('Error parsing existing photos:', error)
        setExistingPhotos([])
        setPhotoPreviews([])
        setPhotos([])
      }
    } else {
      setExistingPhotos([])
      setPhotoPreviews([])
      setPhotos([])
    }
    
    setIsEditing(true)
    setEditingReviewId(review.id)
    setShowForm(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/simple-reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        }
      })

      if (response.ok) {
        await fetchReviews()
        addToast({
          type: 'success',
          title: 'Отзыв удален!',
          message: 'Отзыв успешно удален!',
          duration: 4000
        })
        emitActivityEvent('review_deleted', { venueId, reviewId })
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          title: 'Ошибка при удалении отзыва',
          message: error.error || 'Ошибка при удалении отзыва',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при удалении отзыва',
        message: 'Ошибка при удалении отзыва',
        duration: 6000
      })
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
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        await fetchReviews()
        emitActivityEvent('venue_review_reaction', { venueId, reviewId, type })
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          title: 'Ошибка при оценке отзыва',
          message: error.error || 'Ошибка при оценке отзыва',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error submitting reaction:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при оценке отзыва',
        message: 'Ошибка при оценке отзыва',
        duration: 6000
      })
    }
  }

  const handleSubmitReply = async (reviewId: string, message: string) => {
    if (!user?.id || !message.trim()) return

    setSubmittingReply(true)
    try {
      const response = await fetch(`/api/reviews/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          reviewId,
          message: message.trim()
        })
      })

      if (response.ok) {
        setReplyMessage('')
        setShowReplyForm(null)
        await fetchReviews()
        addToast({
          type: 'success',
          title: 'Ответ добавлен!',
          message: 'Ответ успешно добавлен!',
          duration: 4000
        })
        emitActivityEvent('reply_created', { venueId, reviewId })
      } else {
        const error = await response.json()
        addToast({
          type: 'error',
          title: 'Ошибка при добавлении ответа',
          message: error.error || 'Ошибка при добавлении ответа',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при добавлении ответа',
        message: 'Ошибка при добавлении ответа',
        duration: 6000
      })
    } finally {
      setSubmittingReply(false)
    }
  }

  // Функция оптимизации фото
  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Максимальные размеры
        const maxWidth = 1200
        const maxHeight = 1200
        const maxSize = 1024 * 1024 // 1MB
        
        let { width, height } = img
        
        // Изменяем размер если нужно
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Рисуем оптимизированное изображение
        ctx.drawImage(img, 0, 0, width, height)
        
        // Конвертируем в blob с качеством 85%
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(optimizedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.85)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Оптимизируем каждое фото
      const optimizedFiles = await Promise.all(
        files.map(file => optimizeImage(file))
      )
      
      if (isEditing) {
        // При редактировании добавляем к существующим фото
        setPhotos(prev => [...prev, ...optimizedFiles])
        const newPreviews = optimizedFiles.map(file => URL.createObjectURL(file))
        setPhotoPreviews(prev => [...prev, ...newPreviews])
      } else {
        // При создании нового отзыва
        setPhotos(optimizedFiles)
        const previews = optimizedFiles.map(file => URL.createObjectURL(file))
        setPhotoPreviews(previews)
      }
    }
  }

  const removePhoto = (index: number) => {
    // Если это редактирование, нужно учесть существующие фото
    if (isEditing) {
      const newPreviews = photoPreviews.filter((_, i) => i !== index)
      setPhotoPreviews(newPreviews)
      
      // Если удаляем существующее фото (не новое)
      if (index < existingPhotos.length) {
        const newExistingPhotos = existingPhotos.filter((_, i) => i !== index)
        setExistingPhotos(newExistingPhotos)
      } else {
        // Если удаляем новое фото
        const newPhotoIndex = index - existingPhotos.length
        const newPhotos = photos.filter((_, i) => i !== newPhotoIndex)
        setPhotos(newPhotos)
      }
    } else {
      // Обычное удаление при создании нового отзыва
      const newPhotos = photos.filter((_, i) => i !== index)
      const newPreviews = photoPreviews.filter((_, i) => i !== index)
      setPhotos(newPhotos)
      setPhotoPreviews(newPreviews)
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
              <span className="text-lg font-bold text-gray-900 font-unbounded">{averageRating}</span>
              <span className="text-gray-500 font-unbounded">({reviews.length} отзывов)</span>
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
        {user && hasUserReviewed && (() => {
          const userReview = reviews.find(r => Number(r.user.id) === Number(user.id))
          const isModeration = userReview?.status === 'MODERATION'
          
          return (
            <div className={`relative overflow-hidden rounded-2xl p-6 mb-6 ${
              isModeration 
                ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 shadow-lg shadow-amber-100' 
                : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-lg shadow-blue-100'
            }`}>
              {/* Декоративные элементы */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${
                isModeration ? 'bg-gradient-to-br from-amber-400 to-orange-400' : 'bg-gradient-to-br from-blue-400 to-purple-400'
              } transform translate-x-8 -translate-y-8`}></div>
              <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-5 ${
                isModeration ? 'bg-gradient-to-br from-yellow-400 to-amber-400' : 'bg-gradient-to-br from-indigo-400 to-blue-400'
              } transform -translate-x-6 translate-y-6`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {isModeration ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                              <span className="text-2xl">⏳</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-amber-800 font-unbounded">
                              Ваш отзыв на модерации
                            </h3>
                            <p className="text-amber-600 text-sm mt-1 font-medium">
                              Отзыв отправлен на проверку. После одобрения он появится в списке.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-amber-700">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <span className="text-sm font-medium ml-2">Ожидайте рассмотрения...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-6 h-6 text-white drop-shadow-sm" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-blue-800 font-unbounded">
                              Вы уже оставили отзыв на это место
                            </h3>
                            <p className="text-blue-600 text-xs mt-1 font-medium">
                              Вы можете отредактировать или удалить свой отзыв
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-700">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-xs font-medium">Отзыв опубликован и виден всем</span>
                        </div>
          </div>
        )}
      </div>

                  {!isModeration && (
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => {
                          const userReview = reviews.find(r => Number(r.user.id) === Number(user.id))
                          if (userReview) handleEditReview(userReview)
                        }}
                        className="group bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-unbounded font-medium text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                      >
                        <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Редактировать</span>
                      </button>
                      <button
                        onClick={() => {
                          const userReview = reviews.find(r => Number(r.user.id) === Number(user.id))
                          if (userReview) {
                            setConfirmModal({
                              isOpen: true,
                              reviewId: userReview.id,
                              type: 'delete_review'
                            })
                          }
                        }}
                        className="group bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-unbounded font-medium text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Удалить</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Форма отзыва */}
      {showForm && user && (!hasUserReviewed || isEditing) && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-unbounded">
            {isEditing ? 'Редактировать отзыв' : 'Оставить отзыв'}
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
                Оценка
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
                Комментарий
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите о вашем опыте..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
                Фотографии (до 10 штук)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded"
              />
              {photoPreviews.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300 font-unbounded"
                >
                {submitting ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Отправить отзыв')}
                </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setIsEditing(false)
                  setEditingReviewId(null)
                  setRating(0)
                  setComment('')
                  setPhotos([])
                  setPhotoPreviews([])
                }}
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
            <p className="text-gray-500 text-lg font-unbounded">Пока нет отзывов</p>
            <p className="text-gray-400 font-unbounded">Станьте первым, кто оставит отзыв!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const isCurrentUserReview = user?.id && review.user.id === user.id
            return (
              <div 
                key={review.id} 
                className={`border-b border-gray-100 pb-6 last:border-b-0 ${
                  isCurrentUserReview ? 'bg-blue-50 border-blue-200 rounded-lg p-4' : ''
                }`}
              >
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 font-unbounded">
                      {review.user.name || 'Анонимный пользователь'}
                    </span>
                        {isCurrentUserReview && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-unbounded">
                            Ваш отзыв
                          </span>
                        )}
                      </div>
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
                    </div>
                    <span className="text-sm text-gray-500 font-unbounded">
                      {formatDate(review.createdAt)}
                    </span>
                  {review.comment && (
                    <p className="text-gray-700 mb-3 leading-relaxed font-unbounded">{review.comment}</p>
                  )}
                    {user?.id === review.user.id && review.status === 'MODERATION' && (
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
                                const photos = JSON.parse(review.photos || '[]')
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
                      {user?.id === review.user.id && (
                        <div className="flex space-x-2">
                      <button
                            onClick={() => handleEditReview(review)}
                            className="text-violet-600 hover:text-violet-700 text-sm font-unbounded transition-colors"
                          >
                            Редактировать
                            </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, reviewId: review.id, type: 'delete_review' })}
                            className="text-red-600 hover:text-red-700 text-sm font-unbounded transition-colors"
                      >
                            Удалить
                      </button>
                  </div>
                      )}
                      {user?.id && user.id !== review.user.id && (
                              <button
                          onClick={() => setShowReplyForm(review.id)}
                          className="text-violet-600 hover:text-violet-700 text-sm font-unbounded transition-colors"
                              >
                          Ответить
                              </button>
                            )}
                          </div>
                    {showReplyForm === review.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Напишите ответ..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded"
                            rows={3}
                          />
                        <div className="flex justify-end space-x-2 mt-3">
                            <button
                            onClick={() => setShowReplyForm(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-unbounded"
                            >
                            Отмена
                            </button>
                            <button
                            onClick={() => handleSubmitReply(review.id, replyMessage)}
                            disabled={submittingReply || !replyMessage.trim()}
                            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-400 transition-colors font-unbounded"
                          >
                            {submittingReply ? 'Отправка...' : 'Отправить'}
                            </button>
                          </div>
                        </div>
                    )}
                    {review.replies && review.replies.length > 0 && (
                      <div className="mt-4">
                        <ReviewReplies
                          reviewId={review.id}
                          replies={review.replies}
                          currentUserId={user?.id}
                          onReplyAdded={() => fetchReviews()}
                          showReplyButton={true}
                        />
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })
        )}
      </div>

      {/* Модальное окно подтверждения */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, reviewId: null, type: 'delete_review' })}
        onConfirm={() => {
          if (confirmModal.type === 'delete_review' && confirmModal.reviewId) {
            handleDeleteReview(confirmModal.reviewId)
          setConfirmModal({ isOpen: false, reviewId: null, type: 'delete_review' })
          }
        }}
        title="Удалить отзыв?"
        message="Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />

      {/* Модальное окно просмотра фотографий */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              ×
            </button>
            <img
              src={selectedPhoto}
              alt="Review photo"
              className="w-full h-full object-contain max-h-[80vh]"
            />
            {currentReviewPhotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {currentReviewPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedPhoto(photo)
                      setCurrentPhotoIndex(index)
                    }}
                    className={`w-3 h-3 rounded-full ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}