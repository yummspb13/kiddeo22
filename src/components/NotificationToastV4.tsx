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

interface NotificationToastV4Props {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export default function NotificationToastV4({ notifications, onRemove }: NotificationToastV4Props) {
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
        return <CheckCircle className="w-6 h-6 text-white" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-white" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-white" />
      case 'info':
        return <Info className="w-6 h-6 text-white" />
      case 'favorite':
        return <Heart className="w-6 h-6 text-white" />
      case 'review':
        return <Star className="w-6 h-6 text-white" />
      case 'reply':
        return <Bell className="w-6 h-6 text-white" />
      case 'reaction':
        return <Sparkles className="w-6 h-6 text-white" />
      default:
        return <Info className="w-6 h-6 text-white" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-green-100 font-unbounded',
          accent: 'from-green-400 to-emerald-500'
        }
      case 'error':
        return {
          container: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-red-100 font-unbounded',
          accent: 'from-red-400 to-rose-500'
        }
      case 'warning':
        return {
          container: 'bg-gradient-to-br from-yellow-500 to-amber-600 shadow-yellow-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-yellow-100 font-unbounded',
          accent: 'from-yellow-400 to-amber-500'
        }
      case 'info':
        return {
          container: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-blue-100 font-unbounded',
          accent: 'from-blue-400 to-indigo-500'
        }
      case 'favorite':
        return {
          container: 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-pink-100 font-unbounded',
          accent: 'from-pink-400 to-rose-500'
        }
      case 'review':
        return {
          container: 'bg-gradient-to-br from-yellow-500 to-amber-600 shadow-yellow-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-yellow-100 font-unbounded',
          accent: 'from-yellow-400 to-amber-500'
        }
      case 'reply':
        return {
          container: 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-purple-100 font-unbounded',
          accent: 'from-purple-400 to-violet-500'
        }
      case 'reaction':
        return {
          container: 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-orange-100 font-unbounded',
          accent: 'from-orange-400 to-amber-500'
        }
      default:
        return {
          container: 'bg-gradient-to-br from-gray-500 to-slate-600 shadow-gray-500/25',
          icon: 'bg-white/20',
          title: 'text-white font-unbounded',
          message: 'text-gray-100 font-unbounded',
          accent: 'from-gray-400 to-slate-500'
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
              transform transition-all duration-500 ease-out 
              animate-in slide-in-from-right-full fade-in
              rounded-2xl shadow-2xl p-5 
              ${styles.container}
              hover:shadow-3xl hover:scale-105
              relative overflow-hidden
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Декоративные элементы */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <div className={`w-full h-full bg-gradient-to-br ${styles.accent} rounded-full blur-2xl`} />
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5">
              <div className={`w-full h-full bg-gradient-to-tr ${styles.accent} rounded-full blur-xl`} />
            </div>

            <div className="relative z-10">
              <div className="flex items-start space-x-4">
                {/* Иконка */}
                <div className={`flex-shrink-0 p-3 rounded-xl ${styles.icon} backdrop-blur-sm`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-bold ${styles.title} mb-2`}>
                    {notification.title}
                  </h3>
                  <p className={`text-sm ${styles.message} leading-relaxed mb-3`}>
                    {notification.message}
                  </p>
                  
                  {/* Время */}
                  <div className="text-xs text-white/60 font-unbounded">
                    {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Кнопка закрытия */}
                <button
                  onClick={() => onRemove(notification.id)}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/80 hover:text-white" />
                </button>
              </div>

              {/* Прогресс-бар */}
              <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${styles.accent} rounded-full transition-all duration-100 ease-linear`}
                  style={{
                    width: '100%',
                    animation: 'shrink 5000ms linear forwards'
                  }}
                />
              </div>
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
