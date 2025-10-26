'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestRealNotificationsPage() {
  const { user, loading } = useAuth()
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !user) return
    fetchReviews()
  }, [loading, user])

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true)
      // Пробуем разные события (включая реальные ID из базы)
      const eventIds = [
        'cmgbg6mso000ckvl8l4yx2ysh', // Изумрудный город (есть отзывы)
        'izumrudnyy-gorod', // Слаг события
        'test-event-1', 
        'test-event-2'
      ]
      let reviews: any[] = []
      
      for (const eventId of eventIds) {
        const response = await fetch(`/api/simple-reviews?eventId=${eventId}&status=APPROVED`)
        if (response.ok) {
          const data = await response.json()
          if (data.reviews && data.reviews.length > 0) {
            reviews = [...reviews, ...data.reviews]
            break // Нашли отзывы, останавливаемся
          }
        }
      }
      
      setReviews(reviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoadingReviews(false)
    }
  }

  const testReaction = async (reviewId: string) => {
    if (!user?.id) {
      setResult('Пользователь не авторизован')
      return
    }

    setResult(null)

    try {
      console.log('🔍 Testing reaction for review:', reviewId, 'user:', user.id)
      
      const response = await fetch('/api/simple-reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId: reviewId,
          userId: user.id,
          type: 'LIKE'
        })
      })

      console.log('🔍 Reaction response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Reaction response:', data)
        setResult(`✅ Реакция создана: ${JSON.stringify(data)}`)
        await fetchReviews() // Обновляем список отзывов
      } else {
        const error = await response.json()
        console.error('❌ Reaction error:', error)
        setResult(`❌ Ошибка реакции: ${error.error}`)
      }
    } catch (error) {
      console.error('❌ Error testing reaction:', error)
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  const testReply = async (reviewId: string) => {
    if (!user?.id) {
      setResult('Пользователь не авторизован')
      return
    }

    setResult(null)

    try {
      console.log('🔍 Testing reply for review:', reviewId, 'user:', user.id)
      
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          message: `Тестовый ответ от пользователя ${user.name || user.email}`
        })
      })

      console.log('🔍 Reply response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Reply response:', data)
        setResult(`✅ Ответ создан: ${JSON.stringify(data)}`)
        await fetchReviews() // Обновляем список отзывов
      } else {
        const error = await response.json()
        console.error('❌ Reply error:', error)
        setResult(`❌ Ошибка ответа: ${error.error}`)
      }
    } catch (error) {
      console.error('❌ Error testing reply:', error)
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Не авторизован</h1>
          <p className="text-gray-600">Войдите в систему для тестирования реальных уведомлений</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">
          Тестирование реальных уведомлений
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-unbounded">
            Пользователь: {user.name || user.email} (ID: {user.id})
          </h2>
          
          <div className="mb-4">
            <button
              onClick={fetchReviews}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-unbounded"
            >
              Обновить отзывы
            </button>
            <p className="text-sm text-gray-600 mt-2 font-unbounded">
              Проверяем события: Изумрудный город (ID: cmgbg6mso000ckvl8l4yx2ysh), izumrudnyy-gorod, test-event-1, test-event-2
            </p>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-unbounded ${
                result.includes('✅') ? 'text-green-800' : 'text-red-800'
              }`}>
                {result}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-unbounded">
            Отзывы для тестирования
          </h2>

          {loadingReviews ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-unbounded">Загрузка отзывов...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-unbounded">Отзывов не найдено</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 font-unbounded">
                          {review.user.name || 'Анонимный пользователь'}
                        </h3>
                        <span className="text-sm text-gray-500 font-unbounded">
                          (ID: {review.user.id})
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2 font-unbounded">
                        {review.comment || 'Без комментария'}
                      </p>
                      <div className="text-sm text-gray-500 font-unbounded">
                        Отзыв ID: {review.id} | Рейтинг: {review.rating}/5
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => testReaction(review.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-unbounded"
                      >
                        Лайк
                      </button>
                      <button
                        onClick={() => testReply(review.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-unbounded"
                      >
                        Ответить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 font-unbounded">Инструкции:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 font-unbounded">
            <li>• Нажмите "Лайк" чтобы поставить реакцию на отзыв</li>
            <li>• Нажмите "Ответить" чтобы оставить ответ на отзыв</li>
            <li>• Проверьте логи в консоли браузера и сервера</li>
            <li>• Перейдите на страницу отладки для просмотра уведомлений</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
