"use client"

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export default function VendorNotifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    } else {
      // Если пользователь не авторизован, используем localStorage
      loadFromLocalStorage()
    }
  }, [user?.id])

  const fetchNotifications = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/profile/notifications', {
        headers: {
          'x-user-id': user.id.toString(),
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const parsed = data.notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.createdAt)
        }))
        setNotifications(parsed)
        setUnreadCount(parsed.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Fallback to localStorage
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    const savedNotifications = localStorage.getItem('vendor-notifications')
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications).map((n: unknown) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }))
      setNotifications(parsed)
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
    }
  }

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    
    const updated = [newNotification, ...notifications]
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    
    if (user?.id) {
      // Сохраняем в API
      try {
        await fetch('/api/profile/notifications', {
          method: 'POST',
          headers: {
            'x-user-id': user.id.toString(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: notification.type,
            title: notification.title,
            message: notification.message
          })
        })
      } catch (error) {
        console.error('Error saving notification to API:', error)
      }
    } else {
      // Сохраняем в localStorage
      localStorage.setItem('vendor-notifications', JSON.stringify(updated))
    }
  }

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    
    if (user?.id) {
      // Обновляем в API
      try {
        await fetch('/api/profile/notifications', {
          method: 'PUT',
          headers: {
            'x-user-id': user.id.toString(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationId: id,
            action: 'markAsRead'
          })
        })
      } catch (error) {
        console.error('Error updating notification in API:', error)
      }
    } else {
      // Сохраняем в localStorage
      localStorage.setItem('vendor-notifications', JSON.stringify(updated))
    }
  }

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    setUnreadCount(0)
    
    if (user?.id) {
      // Обновляем в API
      try {
        await fetch('/api/profile/notifications', {
          method: 'PUT',
          headers: {
            'x-user-id': user.id.toString(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'markAllAsRead'
          })
        })
      } catch (error) {
        console.error('Error updating notifications in API:', error)
      }
    } else {
      // Сохраняем в localStorage
      localStorage.setItem('vendor-notifications', JSON.stringify(updated))
    }
  }

  const removeNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    
    if (user?.id) {
      // Удаляем из API
      try {
        await fetch('/api/profile/notifications', {
          method: 'PUT',
          headers: {
            'x-user-id': user.id.toString(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationId: id,
            action: 'delete'
          })
        })
      } catch (error) {
        console.error('Error deleting notification from API:', error)
      }
    } else {
      // Сохраняем в localStorage
      localStorage.setItem('vendor-notifications', JSON.stringify(updated))
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="relative">
      {/* Кнопка уведомлений */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Выпадающий список уведомлений */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Отметить все как прочитанные
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Уведомлений нет
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleString('ru-RU')}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Прочитать
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Оверлей для закрытия */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Экспортируем функцию для добавления уведомлений
export const addVendorNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  // В реальном приложении это будет через контекст или глобальное состояние
  window.dispatchEvent(new CustomEvent('vendor-notification', { detail: notification }))
}
