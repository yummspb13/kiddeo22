// src/components/chat/NotificationsManager.tsx
"use client"

import { useState } from "react"
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Inbox, 
  Settings,
  Check,
  X,
  Filter,
  Search,
  Clock,
  AlertCircle,
  MessageSquare,
  CreditCard,
  Calendar,
  Star
} from "@/lib/icons"

interface Notification {
  id: number
  type: 'MESSAGE' | 'REVIEW' | 'BOOKING' | 'PAYMENT' | 'SYSTEM'
  channel: 'EMAIL' | 'PUSH' | 'INBOX' | 'SMS'
  title: string
  content: string
  data?: unknown
  isRead: boolean
  sentAt?: Date
  readAt?: Date
  createdAt: Date
}

interface NotificationsManagerProps {
  notifications: Notification[]
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (id: number) => void
  onUpdateSettings: (settings: NotificationSettings) => void
}

interface NotificationSettings {
  emailEnabled: boolean
  pushEnabled: boolean
  inboxEnabled: boolean
  smsEnabled: boolean
  messageNotifications: boolean
  reviewNotifications: boolean
  bookingNotifications: boolean
  paymentNotifications: boolean
  systemNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

const TYPE_ICONS = {
  MESSAGE: MessageSquare,
  REVIEW: Star,
  BOOKING: Calendar,
  PAYMENT: CreditCard,
  SYSTEM: AlertCircle
}

const TYPE_LABELS = {
  MESSAGE: 'Сообщение',
  REVIEW: 'Отзыв',
  BOOKING: 'Бронирование',
  PAYMENT: 'Платеж',
  SYSTEM: 'Система'
}

const CHANNEL_ICONS = {
  EMAIL: Mail,
  PUSH: Smartphone,
  INBOX: Inbox,
  SMS: MessageSquare
}

const CHANNEL_LABELS = {
  EMAIL: 'Email',
  PUSH: 'Push',
  INBOX: 'В приложении',
  SMS: 'SMS'
}

export default function NotificationsManager({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSettings
}: NotificationsManagerProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications')
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    pushEnabled: true,
    inboxEnabled: true,
    smsEnabled: false,
    messageNotifications: true,
    reviewNotifications: true,
    bookingNotifications: true,
    paymentNotifications: true,
    systemNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'ALL' || 
      (filter === 'UNREAD' && !notification.isRead) ||
      (filter === 'READ' && notification.isRead)
    const matchesType = typeFilter === 'ALL' || notification.type === typeFilter
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesType && matchesSearch
  })

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'сейчас'
    if (minutes < 60) return `${minutes}м назад`
    if (hours < 24) return `${hours}ч назад`
    if (days < 7) return `${days}д назад`
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const getTypeIcon = (type: string) => {
    const IconComponent = TYPE_ICONS[type as keyof typeof TYPE_ICONS]
    return <IconComponent className="w-5 h-5" />
  }

  const getChannelIcon = (channel: string) => {
    const IconComponent = CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS]
    return <IconComponent className="w-4 h-4" />
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Заголовок и табы */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Уведомления</h2>
          <p className="text-gray-600">Управляйте уведомлениями и настройками</p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
            >
              Отметить все как прочитанные
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="w-5 h-5 mr-2 inline" />
            Уведомления
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-5 h-5 mr-2 inline" />
            Настройки
          </button>
        </nav>
      </div>

      {/* Контент табов */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Фильтры */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по уведомлениям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Все</option>
              <option value="UNREAD">Непрочитанные</option>
              <option value="READ">Прочитанные</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Все типы</option>
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>

          {/* Список уведомлений */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет уведомлений</h3>
                <p className="text-gray-600">Уведомления появятся здесь</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead 
                      ? 'bg-white border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          notification.isRead ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {getChannelIcon(notification.channel)}
                            <span className="text-xs text-gray-500">
                              {CHANNEL_LABELS[notification.channel as keyof typeof CHANNEL_LABELS]}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        notification.isRead ? 'text-gray-600' : 'text-blue-700'
                      }`}>
                        {notification.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {TYPE_LABELS[notification.type as keyof typeof TYPE_LABELS]}
                          </span>
                          {notification.sentAt && (
                            <span className="text-xs text-gray-500">
                              • Отправлено {formatDate(notification.sentAt)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Отметить как прочитанное"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Удалить"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Каналы уведомлений */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Каналы уведомлений</h3>
            <div className="space-y-4">
              {[
                { key: 'emailEnabled', label: 'Email', icon: Mail },
                { key: 'pushEnabled', label: 'Push-уведомления', icon: Smartphone },
                { key: 'inboxEnabled', label: 'В приложении', icon: Inbox },
                { key: 'smsEnabled', label: 'SMS', icon: MessageSquare }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[key as keyof NotificationSettings] as boolean}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Типы уведомлений */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Типы уведомлений</h3>
            <div className="space-y-4">
              {[
                { key: 'messageNotifications', label: 'Сообщения в чате', icon: MessageSquare },
                { key: 'reviewNotifications', label: 'Новые отзывы', icon: Star },
                { key: 'bookingNotifications', label: 'Бронирования', icon: Calendar },
                { key: 'paymentNotifications', label: 'Платежи', icon: CreditCard },
                { key: 'systemNotifications', label: 'Системные уведомления', icon: AlertCircle }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[key as keyof NotificationSettings] as boolean}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Тихие часы */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Тихие часы</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Включить тихие часы</span>
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Начало
                    </label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Конец
                    </label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Кнопка сохранения */}
          <div className="flex justify-end">
            <button
              onClick={() => onUpdateSettings(settings)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
