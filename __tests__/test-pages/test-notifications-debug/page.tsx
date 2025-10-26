'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export default function TestNotificationsDebugPage() {
  const { user, loading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !user) return

    fetchNotifications()
  }, [loading, user])

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      setError(null)
      
      console.log('🔍 Fetching notifications for user:', user?.id)
      
      const response = await fetch('/api/profile/notifications', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      console.log('🔍 Response status:', response.status)
      
      if (response.status === 401) {
        setError('Не авторизован')
        return
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        setError(`Ошибка ${response.status}: ${errorText}`)
        return
      }
      
      const data = await response.json()
      console.log('✅ Notifications data:', data)
      
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setLoadingNotifications(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action: 'markAsRead'
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action: 'delete'
        })
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
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
          <p className="text-gray-600">Войдите в систему для просмотра уведомлений</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">
          Отладка уведомлений
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-unbounded">
              Уведомления пользователя
            </h2>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-unbounded"
            >
              Обновить
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 font-unbounded">
              Пользователь: {user.name || user.email} (ID: {user.id})
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-unbounded">Ошибка: {error}</p>
            </div>
          )}

          {loadingNotifications ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-unbounded">Загрузка уведомлений...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-unbounded">Уведомлений нет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-semibold font-unbounded ${
                          notification.isRead ? 'text-gray-700' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-unbounded">
                            Новое
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-unbounded ${
                        notification.isRead ? 'text-gray-600' : 'text-blue-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="mt-2 text-xs text-gray-500 font-unbounded">
                        Тип: {notification.type} | 
                        Создано: {new Date(notification.createdAt).toLocaleString('ru-RU')}
                      </div>
                      {notification.data && (
                        <div className="mt-2 text-xs text-gray-500 font-unbounded">
                          Данные: {JSON.stringify(notification.data, null, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors font-unbounded"
                        >
                          Прочитано
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors font-unbounded"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
