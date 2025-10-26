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

interface NotificationToastV2Props {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export default function NotificationToastV2({ notifications, onRemove }: NotificationToastV2Props) {
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
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />
      case 'favorite':
        return <Heart className="w-6 h-6 text-pink-600" />
      case 'review':
        return <Star className="w-6 h-6 text-yellow-600" />
      case 'reply':
        return <Bell className="w-6 h-6 text-purple-600" />
      case 'reaction':
        return <Sparkles className="w-6 h-6 text-orange-600" />
      default:
        return <Info className="w-6 h-6 text-gray-600" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-l-4 border-green-500 shadow-green-200/50 hover:shadow-green-300/60',
          icon: 'bg-gradient-to-br from-green-100 to-emerald-100',
          title: 'text-green-800 font-unbounded',
          message: 'text-green-700 font-unbounded',
          accent: 'from-green-400 to-emerald-400'
        }
      case 'error':
        return {
          container: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-l-4 border-red-500 shadow-red-200/50 hover:shadow-red-300/60',
          icon: 'bg-gradient-to-br from-red-100 to-rose-100',
          title: 'text-red-800 font-unbounded',
          message: 'text-red-700 font-unbounded',
          accent: 'from-red-400 to-rose-400'
        }
      case 'warning':
        return {
          container: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-l-4 border-yellow-500 shadow-yellow-200/50 hover:shadow-yellow-300/60',
          icon: 'bg-gradient-to-br from-yellow-100 to-amber-100',
          title: 'text-yellow-800 font-unbounded',
          message: 'text-yellow-700 font-unbounded',
          accent: 'from-yellow-400 to-amber-400'
        }
      case 'info':
        return {
          container: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-500 shadow-blue-200/50 hover:shadow-blue-300/60',
          icon: 'bg-gradient-to-br from-blue-100 to-indigo-100',
          title: 'text-blue-800 font-unbounded',
          message: 'text-blue-700 font-unbounded',
          accent: 'from-blue-400 to-indigo-400'
        }
      case 'favorite':
        return {
          container: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 border-l-4 border-pink-500 shadow-pink-200/50 hover:shadow-pink-300/60',
          icon: 'bg-gradient-to-br from-pink-100 to-rose-100',
          title: 'text-pink-800 font-unbounded',
          message: 'text-pink-700 font-unbounded',
          accent: 'from-pink-400 to-rose-400'
        }
      case 'review':
        return {
          container: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-l-4 border-yellow-500 shadow-yellow-200/50 hover:shadow-yellow-300/60',
          icon: 'bg-gradient-to-br from-yellow-100 to-amber-100',
          title: 'text-yellow-800 font-unbounded',
          message: 'text-yellow-700 font-unbounded',
          accent: 'from-yellow-400 to-amber-400'
        }
      case 'reply':
        return {
          container: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border-l-4 border-purple-500 shadow-purple-200/50 hover:shadow-purple-300/60',
          icon: 'bg-gradient-to-br from-purple-100 to-violet-100',
          title: 'text-purple-800 font-unbounded',
          message: 'text-purple-700 font-unbounded',
          accent: 'from-purple-400 to-violet-400'
        }
      case 'reaction':
        return {
          container: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-l-4 border-orange-500 shadow-orange-200/50 hover:shadow-orange-300/60',
          icon: 'bg-gradient-to-br from-orange-100 to-amber-100',
          title: 'text-orange-800 font-unbounded',
          message: 'text-orange-700 font-unbounded',
          accent: 'from-orange-400 to-amber-400'
        }
      default:
        return {
          container: 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 border-l-4 border-gray-500 shadow-gray-200/50 hover:shadow-gray-300/60',
          icon: 'bg-gradient-to-br from-gray-100 to-slate-100',
          title: 'text-gray-800 font-unbounded',
          message: 'text-gray-700 font-unbounded',
          accent: 'from-gray-400 to-slate-400'
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
              border border-white/30 backdrop-blur-sm
              relative overflow-hidden
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Декоративные элементы */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <div className={`w-full h-full bg-gradient-to-br ${styles.accent} rounded-full blur-xl`} />
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16 opacity-5">
              <div className={`w-full h-full bg-gradient-to-tr ${styles.accent} rounded-full blur-lg`} />
            </div>

            <div className="relative z-10">
              <div className="flex items-start space-x-4">
                {/* Иконка */}
                <div className={`flex-shrink-0 p-3 rounded-2xl ${styles.icon} shadow-lg`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-bold ${styles.title} mb-1`}>
                    {notification.title}
                  </h3>
                  <p className={`text-xs ${styles.message} leading-relaxed`}>
                    {notification.message}
                  </p>
                  
                  {/* Время */}
                  <div className="mt-2 text-xs text-gray-500 font-unbounded">
                    {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Кнопка закрытия */}
                <button
                  onClick={() => onRemove(notification.id)}
                  className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* Прогресс-бар */}
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
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
