"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, Smartphone, Settings, Check, X, Calendar, Gift, Star, Heart } from "@/lib/icons"
import { useAuth } from "@/contexts/AuthContext"

interface Notification {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

interface NotificationSettings {
  emailNewEvents: boolean
  emailPriceDrops: boolean
  emailReminders: boolean
  emailReviews: boolean
  emailNewsletter: boolean
  pushNewEvents: boolean
  pushPriceDrops: boolean
  pushReminders: boolean
  pushReviews: boolean
  frequency: string
}

interface NotificationsClientProps {
  userId?: string
}

export default function NotificationsClient({ userId }: NotificationsClientProps) {
  const { user, loading } = useAuth()
  const isLoading = loading
  const isAuthenticated = !!user
  
  console.log('🔔 NotificationsClient render:', {
    user,
    loading,
    isLoading,
    isAuthenticated,
    userId
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNewEvents: true,
    emailPriceDrops: true,
    emailReminders: true,
    emailReviews: true,
    emailNewsletter: true,
    pushNewEvents: true,
    pushPriceDrops: false,
    pushReminders: true,
    pushReviews: true,
    frequency: "daily"
  })
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [showSettings, setShowSettings] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [paginatedNotifications, setPaginatedNotifications] = useState<Notification[]>([])

  // Получаем userId из сессии
  const currentUserId = userId || user?.id

  // Эффект для пагинации уведомлений
  useEffect(() => {
    if (notifications.length === 0) {
      setPaginatedNotifications([])
      setTotalNotifications(0)
      setTotalPages(1)
      return
    }

    const filteredNotifications = notifications.filter(notification => {
      switch (filter) {
        case "unread":
          return !notification.isRead
        case "read":
          return notification.isRead
        default:
          return true
      }
    })

    setTotalNotifications(filteredNotifications.length)
    setTotalPages(Math.ceil(filteredNotifications.length / 10))

    const startIndex = (currentPage - 1) * 10
    const endIndex = startIndex + 10
    setPaginatedNotifications(filteredNotifications.slice(startIndex, endIndex))
  }, [notifications, filter, currentPage])

  // Загрузка уведомлений
  useEffect(() => {
    console.log('🔔 NotificationsClient useEffect:', {
      isLoading,
      isAuthenticated,
      currentUserId,
      user: user?.id
    })
    
    // Ждем загрузки сессии и проверяем авторизацию
    if (isLoading || !isAuthenticated || !currentUserId) {
      console.log('🔔 NotificationsClient: Skipping fetch - loading:', isLoading, 'auth:', isAuthenticated, 'userId:', currentUserId)
      return
    }

    const fetchNotifications = async () => {
      try {
        console.log('🔔 Fetching notifications for user:', currentUserId)
        const response = await fetch('/api/profile/notifications')
        
        if (response.status === 401) {
          console.error('❌ Unauthorized - session expired')
          setNotificationsLoading(false)
          return
        }
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Notifications loaded:', data.notifications?.length || 0)
          setNotifications(data.notifications || [])
        } else {
          console.error('❌ Failed to fetch notifications:', response.status)
        }
      } catch (error) {
        console.error('❌ Error fetching notifications:', error)
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchNotifications()
  }, [isLoading, isAuthenticated, currentUserId])

  // Загрузка настроек уведомлений
  useEffect(() => {
    if (isLoading || !isAuthenticated || !currentUserId) {
      return
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/profile/notifications/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings || settings)
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error)
      }
    }

    fetchSettings()
  }, [isLoading, isAuthenticated, currentUserId])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_event":
        return <Calendar className="w-5 h-5 text-blue-600" />
      case "price_drop":
        return <Gift className="w-5 h-5 text-green-600" />
      case "reminder":
        return <Bell className="w-5 h-5 text-yellow-600" />
      case "review_response":
        return <Star className="w-5 h-5 text-purple-600" />
      case "loyalty_points":
        return <Heart className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_event":
        return "bg-blue-50 border-blue-200"
      case "price_drop":
        return "bg-green-50 border-green-200"
      case "reminder":
        return "bg-yellow-50 border-yellow-200"
      case "review_response":
        return "bg-purple-50 border-purple-200"
      case "loyalty_points":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, action: 'markAsRead' })
      })

      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' })
      })

      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, action: 'delete' })
      })

      if (response.ok) {
        setNotifications(notifications.filter(notif => notif.id !== id))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const updateSettings = async (newSettings: NotificationSettings) => {
    try {
      const response = await fetch('/api/profile/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setSettings(newSettings)
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.isRead
      case "read":
        return notification.isRead
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Показываем загрузку во время проверки авторизации
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  // Если не авторизован, показываем сообщение
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Требуется авторизация</h3>
          <p className="text-gray-500">Для просмотра уведомлений необходимо войти в систему</p>
        </div>
      </div>
    )
  }

  // Показываем загрузку уведомлений
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка уведомлений...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 profile-content-mobile md:min-h-screen md:bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 profile-p-4-mobile md:max-w-4xl md:mx-auto md:px-4 md:sm:px-6 md:lg:px-8 md:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 profile-card-mobile md:bg-white md:rounded-lg md:shadow-sm md:p-6 md:mb-6">
          <div className="flex items-center justify-between profile-flex-mobile profile-items-center-mobile profile-justify-between-mobile md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 profile-text-2xl-mobile md:text-2xl">Уведомления</h1>
              <p className="text-gray-600 mt-1 profile-text-sm-mobile md:text-gray-600 md:mt-1">
                Управляйте уведомлениями и настройками
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Настройки</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Отметить все как прочитанные
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки уведомлений</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Email уведомления</span>
                </h4>
                <div className="space-y-3">
                  {[
                    { key: "emailNewEvents", label: "Новые события" },
                    { key: "emailPriceDrops", label: "Снижение цен" },
                    { key: "emailReminders", label: "Напоминания" },
                    { key: "emailReviews", label: "Ответы на отзывы" },
                    { key: "emailNewsletter", label: "Новостная рассылка" }
                  ].map((setting) => (
                    <label key={setting.key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings[setting.key as keyof NotificationSettings] as boolean}
                        onChange={(e) => {
                          const newSettings = {
                            ...settings,
                            [setting.key]: e.target.checked
                          }
                          setSettings(newSettings)
                          updateSettings(newSettings)
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{setting.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <span>Push уведомления</span>
                </h4>
                <div className="space-y-3">
                  {[
                    { key: "pushNewEvents", label: "Новые события" },
                    { key: "pushPriceDrops", label: "Снижение цен" },
                    { key: "pushReminders", label: "Напоминания" },
                    { key: "pushReviews", label: "Ответы на отзывы" }
                  ].map((setting) => (
                    <label key={setting.key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings[setting.key as keyof NotificationSettings] as boolean}
                        onChange={(e) => {
                          const newSettings = {
                            ...settings,
                            [setting.key]: e.target.checked
                          }
                          setSettings(newSettings)
                          updateSettings(newSettings)
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{setting.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Частота уведомлений
                  </label>
                  <select
                    value={settings.frequency}
                    onChange={(e) => {
                      const newSettings = { ...settings, frequency: e.target.value }
                      setSettings(newSettings)
                      updateSettings(newSettings)
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="immediate">Мгновенно</option>
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
            {[
              { key: "all", label: "Все уведомления" },
              { key: "unread", label: `Непрочитанные (${unreadCount})` },
              { key: "read", label: "Прочитанные" }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as "all" | "unread" | "read")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Уведомления</h3>
            <div className="text-sm text-gray-500">
              {totalNotifications} уведомлений
            </div>
          </div>

          {paginatedNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Уведомлений не найдено</h3>
              <p className="text-gray-500">
                {filter === "all" 
                  ? "У вас пока нет уведомлений"
                  : `Нет уведомлений в категории "${filter === "unread" ? "Непрочитанные" : "Прочитанные"}"`
                }
              </p>
            </div>
          ) : (
            <>
              {paginatedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                  notification.isRead ? "opacity-75" : ""
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-gray-700 mb-2">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Отметить как прочитанное"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Удалить"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}