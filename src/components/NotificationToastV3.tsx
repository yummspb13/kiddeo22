'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, Star, Heart, Gift, Bell, Sparkles } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'favorite' | 'review' | 'reply' | 'reaction' | 'default'
  title: string
  message: string
  duration?: number
  createdAt: number
}

interface NotificationToastV3Props {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export default function NotificationToastV3({ notifications, onRemove }: NotificationToastV3Props) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications)
  }, [notifications])

  useEffect(() => {
    notifications.forEach(notification => {
      const duration = notification.duration || 5000
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, duration)

      return () => clearTimeout(timer)
    })
  }, [notifications, onRemove])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'favorite':
        return <Heart className="w-5 h-5 text-pink-600" />
      case 'review':
        return <Star className="w-5 h-5 text-yellow-600" />
      case 'reply':
        return <Bell className="w-5 h-5 text-purple-600" />
      case 'reaction':
        return <Sparkles className="w-5 h-5 text-orange-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-white border-l-4 border-green-500 shadow-lg hover:shadow-xl',
          icon: 'text-green-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-green-500'
        }
      case 'error':
        return {
          container: 'bg-white border-l-4 border-red-500 shadow-lg hover:shadow-xl',
          icon: 'text-red-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-red-500'
        }
      case 'warning':
        return {
          container: 'bg-white border-l-4 border-yellow-500 shadow-lg hover:shadow-xl',
          icon: 'text-yellow-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-yellow-500'
        }
      case 'info':
        return {
          container: 'bg-white border-l-4 border-blue-500 shadow-lg hover:shadow-xl',
          icon: 'text-blue-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-blue-500'
        }
      case 'favorite':
        return {
          container: 'bg-white border-l-4 border-pink-500 shadow-lg hover:shadow-xl',
          icon: 'text-pink-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-pink-500'
        }
      case 'review':
        return {
          container: 'bg-white border-l-4 border-yellow-500 shadow-lg hover:shadow-xl',
          icon: 'text-yellow-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-yellow-500'
        }
      case 'reply':
        return {
          container: 'bg-white border-l-4 border-purple-500 shadow-lg hover:shadow-xl',
          icon: 'text-purple-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-purple-500'
        }
      case 'reaction':
        return {
          container: 'bg-white border-l-4 border-orange-500 shadow-lg hover:shadow-xl',
          icon: 'text-orange-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-orange-500'
        }
      default:
        return {
          container: 'bg-white border-l-4 border-gray-500 shadow-lg hover:shadow-xl',
          icon: 'text-gray-600',
          title: 'text-gray-900 font-unbounded',
          message: 'text-gray-600 font-unbounded',
          accent: 'bg-gray-500'
        }
    }
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-35 right-4 z-[9999] space-y-3 max-w-sm">
      {visibleNotifications.map((notification, index) => {
        const styles = getNotificationStyles(notification.type)
        return (
          <div
            key={notification.id}
            className={`
              transform transition-all duration-300 ease-out 
              animate-in slide-in-from-right-full fade-in
              rounded-lg p-4 
              ${styles.container}
              hover:scale-105
              relative
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <div className="flex items-start space-x-3">
              {/* Иконка */}
              <div className={`flex-shrink-0 ${styles.icon}`}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Контент */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold ${styles.title} mb-1`}>
                  {notification.title}
                </h3>
                <p className={`text-sm ${styles.message} leading-relaxed`}>
                  {notification.message}
                </p>
                
                {/* Время */}
                <div className="mt-2 text-xs text-gray-400 font-unbounded">
                  {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Кнопка закрытия */}
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Прогресс-бар */}
            <div className="mt-3 h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${styles.accent} rounded-full transition-all duration-100 ease-linear`}
                style={{
                  width: '100%',
                  animation: 'shrink 5000ms linear forwards'
                }}
              />
            </div>
          </div>
        )
      })}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
