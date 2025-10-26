'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestCreateNotificationsPage() {
  const { user, loading } = useAuth()
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const createTestNotifications = async () => {
    if (!user?.id) {
      setResult('Пользователь не авторизован')
      return
    }

    setCreating(true)
    setResult(null)

    try {
      // Создаем тестовые уведомления через API
      const notifications = [
        {
          userId: parseInt(user.id),
          type: 'review_reaction',
          title: 'Получена реакция на отзыв',
          message: 'На ваш отзыв к мероприятию "Тестовое мероприятие" поставили лайк.',
          data: {
            reviewId: 'test-review-1',
            eventId: 'test-event-1',
            eventTitle: 'Тестовое мероприятие',
            reactionType: 'LIKE',
            reactionAuthorId: 999
          },
          isRead: false,
          isActive: true
        },
        {
          userId: parseInt(user.id),
          type: 'review_reply_received',
          title: 'Получен ответ на отзыв',
          message: 'На ваш отзыв к мероприятию "Тестовое мероприятие" ответил пользователь.',
          data: {
            reviewId: 'test-review-1',
            replyId: 'test-reply-1',
            eventId: 'test-event-1',
            eventTitle: 'Тестовое мероприятие',
            replyAuthorId: 999,
            replyAuthorName: 'Тестовый пользователь'
          },
          isRead: false,
          isActive: true
        },
        {
          userId: parseInt(user.id),
          type: 'success',
          title: 'Успешно!',
          message: 'Тестовое уведомление об успехе создано.',
          data: {
            test: true
          },
          isRead: false,
          isActive: true
        }
      ]

      // Создаем уведомления через Prisma напрямую
      const response = await fetch('/api/test-create-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notifications })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Создано ${data.count} уведомлений`)
      } else {
        const error = await response.json()
        setResult(`❌ Ошибка: ${error.error}`)
      }
    } catch (error) {
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setCreating(false)
    }
  }

  const clearNotifications = async () => {
    if (!user?.id) {
      setResult('Пользователь не авторизован')
      return
    }

    setCreating(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-clear-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(user.id) })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Удалено ${data.count} уведомлений`)
      } else {
        const error = await response.json()
        setResult(`❌ Ошибка: ${error.error}`)
      }
    } catch (error) {
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setCreating(false)
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
          <p className="text-gray-600">Войдите в систему для создания тестовых уведомлений</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">
          Создание тестовых уведомлений
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 font-unbounded">
              Пользователь: {user.name || user.email} (ID: {user.id})
            </h2>
          </div>

          <div className="space-y-4">
            <button
              onClick={createTestNotifications}
              disabled={creating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-unbounded disabled:opacity-50"
            >
              {creating ? 'Создание...' : 'Создать тестовые уведомления'}
            </button>

            <button
              onClick={clearNotifications}
              disabled={creating}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-unbounded disabled:opacity-50 ml-4"
            >
              {creating ? 'Удаление...' : 'Очистить уведомления'}
            </button>
          </div>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-unbounded ${
                result.includes('✅') ? 'text-green-800' : 'text-red-800'
              }`}>
                {result}
              </p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-unbounded">
              Создаваемые уведомления:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 font-unbounded">
              <li>• Реакция на отзыв (review_reaction)</li>
              <li>• Ответ на отзыв (review_reply_received)</li>
              <li>• Успешное уведомление (success)</li>
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500 font-unbounded">
              После создания уведомлений перейдите на{' '}
              <a href="/test-notifications-debug" className="text-blue-600 hover:underline">
                страницу отладки
              </a>{' '}
              для их просмотра.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
