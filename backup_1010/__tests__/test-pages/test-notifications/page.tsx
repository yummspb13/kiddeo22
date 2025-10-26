'use client'

import { useState } from 'react'
import { Bell, Star, MessageCircle, ThumbsUp, User, Calendar, Gift, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'review_reply_received' | 'review_reaction' | 'review_created' | 'child_added' | 'user_registered'
  title: string
  message: string
  createdAt: string
  duration?: number
}

export default function TestNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])
  const [selectedDesign, setSelectedDesign] = useState<number>(1)

  // Тестовые уведомления
  const testNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Отзыв добавлен!',
      message: 'Ваш отзыв о мероприятии "Изумрудный город" успешно опубликован',
      createdAt: new Date().toISOString(),
      duration: 4000
    },
    {
      id: '2',
      type: 'review_reply_received',
      title: 'Получен ответ на отзыв',
      message: 'Пользователь Анна ответил на ваш отзыв о мероприятии "Цирк на льду"',
      createdAt: new Date().toISOString(),
      duration: 5000
    },
    {
      id: '3',
      type: 'review_reaction',
      title: 'Реакция на отзыв',
      message: 'Кто-то поставил лайк на ваш отзыв о мероприятии "Театр теней"',
      createdAt: new Date().toISOString(),
      duration: 3000
    },
    {
      id: '4',
      type: 'child_added',
      title: 'Ребенок добавлен',
      message: 'Вы успешно добавили ребенка "Мария" в профиль',
      createdAt: new Date().toISOString(),
      duration: 4000
    },
    {
      id: '5',
      type: 'error',
      title: 'Ошибка',
      message: 'Не удалось загрузить данные. Попробуйте еще раз.',
      createdAt: new Date().toISOString(),
      duration: 6000
    }
  ]

  const addNotification = (notification: Notification) => {
    const newNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    
    setNotifications(prev => [...prev, newNotification])
    setVisibleNotifications(prev => [...prev, newNotification])
    
    // Автоматически скрываем уведомление
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, newNotification.duration || 5000)
  }

  const removeNotification = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id))
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setVisibleNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review_reply_received':
        return <MessageCircle className="w-6 h-6 text-blue-500" />
      case 'review_reaction':
        return <ThumbsUp className="w-6 h-6 text-green-500" />
      case 'review_created':
        return <Star className="w-6 h-6 text-yellow-500" />
      case 'child_added':
        return <User className="w-6 h-6 text-purple-500" />
      case 'user_registered':
        return <Bell className="w-6 h-6 text-indigo-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
      default:
        return <Bell className="w-6 h-6 text-gray-500" />
    }
  }

  const renderNotificationDesign1 = (notification: Notification, index: number) => (
    <div
      key={notification.id}
      className="transform transition-all duration-500 ease-out animate-in slide-in-from-right-full fade-in rounded-xl shadow-xl p-4 backdrop-blur-sm bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 shadow-blue-200/50 hover:shadow-2xl hover:scale-105 border border-white/20"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'slideInRight 0.5s ease-out, fadeIn 0.5s ease-out'
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-2 rounded-full bg-blue-100 text-blue-600">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-blue-900 leading-tight">
              {notification.title}
            </h4>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/50"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500 font-medium">
              {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/60 rounded-full animate-pulse"
                style={{
                  animation: `shrink ${(notification.duration || 5000) / 1000}s linear forwards`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationDesign2 = (notification: Notification, index: number) => (
    <div
      key={notification.id}
      className="transform transition-all duration-300 ease-out animate-in slide-in-from-right-full fade-in rounded-lg shadow-lg p-4 bg-white border border-gray-200 hover:shadow-xl hover:scale-105"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'slideInRight 0.3s ease-out, fadeIn 0.3s ease-out'
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h4>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )

  const renderNotificationDesign3 = (notification: Notification, index: number) => (
    <div
      key={notification.id}
      className="transform transition-all duration-400 ease-out animate-in slide-in-from-right-full fade-in rounded-2xl shadow-2xl p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-3xl hover:scale-105"
      style={{
        animationDelay: `${index * 75}ms`,
        animation: 'slideInRight 0.4s ease-out, fadeIn 0.4s ease-out'
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-purple-900 leading-tight">
              {notification.title}
            </h4>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-purple-400 hover:text-purple-600 transition-colors p-1 rounded-full hover:bg-purple-100"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-purple-700 mt-2 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-purple-500 font-semibold">
              {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="w-20 h-1 bg-purple-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                style={{
                  animation: `shrink ${(notification.duration || 5000) / 1000}s linear forwards`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationDesign4 = (notification: Notification, index: number) => (
    <div
      key={notification.id}
      className="transform transition-all duration-350 ease-out animate-in slide-in-from-right-full fade-in rounded-lg shadow-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 hover:shadow-xl hover:scale-105"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'slideInRight 0.35s ease-out, fadeIn 0.35s ease-out'
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 p-2 rounded-full bg-green-100 text-green-600">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-green-900">
              {notification.title}
            </h4>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {notification.message}
          </p>
        </div>
        <div className="flex-shrink-0 text-xs text-green-500">
          {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )

  const renderNotificationDesign5 = (notification: Notification, index: number) => (
    <div
      key={notification.id}
      className="transform transition-all duration-450 ease-out animate-in slide-in-from-right-full fade-in rounded-xl shadow-xl p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 hover:shadow-2xl hover:scale-105"
      style={{
        animationDelay: `${index * 80}ms`,
        animation: 'slideInRight 0.45s ease-out, fadeIn 0.45s ease-out'
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-orange-100 to-red-100">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-orange-900 leading-tight">
              {notification.title}
            </h4>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-orange-400 hover:text-orange-600 transition-colors p-1 rounded-full hover:bg-orange-100"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-orange-700 mt-1 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-orange-500 font-medium">
              {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-orange-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => {
    switch (selectedDesign) {
      case 1:
        return visibleNotifications.map((notification, index) => renderNotificationDesign1(notification, index))
      case 2:
        return visibleNotifications.map((notification, index) => renderNotificationDesign2(notification, index))
      case 3:
        return visibleNotifications.map((notification, index) => renderNotificationDesign3(notification, index))
      case 4:
        return visibleNotifications.map((notification, index) => renderNotificationDesign4(notification, index))
      case 5:
        return visibleNotifications.map((notification, index) => renderNotificationDesign5(notification, index))
      default:
        return visibleNotifications.map((notification, index) => renderNotificationDesign1(notification, index))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Тест уведомлений</h1>
        
        {/* Контролы */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Управление уведомлениями</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Выберите дизайн:</label>
              <select
                value={selectedDesign}
                onChange={(e) => setSelectedDesign(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Дизайн 1 - Синий градиент</option>
                <option value={2}>Дизайн 2 - Минималистичный</option>
                <option value={3}>Дизайн 3 - Фиолетовый градиент</option>
                <option value={4}>Дизайн 4 - Зеленый с полосой</option>
                <option value={5}>Дизайн 5 - Оранжевый с точками</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Действия:</label>
              <div className="space-y-2">
                <button
                  onClick={clearAllNotifications}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Очистить все
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статистика:</label>
              <div className="text-sm text-gray-600">
                <p>Всего: {notifications.length}</p>
                <p>Видимых: {visibleNotifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {testNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => addNotification(notification)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {notification.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Область уведомлений */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Область уведомлений</h2>
          <p className="text-gray-600 mb-4">
            Уведомления отображаются в правом верхнем углу экрана, ниже хедера (top-35).
            Они имеют высокий z-index (9999) и должны быть видны поверх всего контента.
          </p>
          <div className="fixed top-35 right-4 z-[9999] space-y-3 max-w-sm">
            {renderNotifications()}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}
