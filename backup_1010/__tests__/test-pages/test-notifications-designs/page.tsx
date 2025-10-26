'use client'

import { useState } from 'react'
import NotificationToast from '@/components/NotificationToast'
import NotificationToastV2 from '@/components/NotificationToastV2'
import NotificationToastV3 from '@/components/NotificationToastV3'
import NotificationToastV4 from '@/components/NotificationToastV4'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'favorite' | 'review' | 'reply' | 'reaction' | 'default'
  title: string
  message: string
  duration?: number
  createdAt: number
}

export default function TestNotificationsDesignsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsV2, setNotificationsV2] = useState<Notification[]>([])
  const [notificationsV3, setNotificationsV3] = useState<Notification[]>([])
  const [notificationsV4, setNotificationsV4] = useState<Notification[]>([])

  const addNotification = (type: Notification['type'], title: string, message: string, version: 'v1' | 'v2' | 'v3' | 'v4') => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      duration: 5000,
      createdAt: Date.now()
    }

    switch (version) {
      case 'v1':
        setNotifications(prev => [...prev, notification])
        break
      case 'v2':
        setNotificationsV2(prev => [...prev, notification])
        break
      case 'v3':
        setNotificationsV3(prev => [...prev, notification])
        break
      case 'v4':
        setNotificationsV4(prev => [...prev, notification])
        break
    }
  }

  const removeNotification = (id: string, version: 'v1' | 'v2' | 'v3' | 'v4') => {
    switch (version) {
      case 'v1':
        setNotifications(prev => prev.filter(n => n.id !== id))
        break
      case 'v2':
        setNotificationsV2(prev => prev.filter(n => n.id !== id))
        break
      case 'v3':
        setNotificationsV3(prev => prev.filter(n => n.id !== id))
        break
      case 'v4':
        setNotificationsV4(prev => prev.filter(n => n.id !== id))
        break
    }
  }

  const testNotifications = [
    { type: 'success' as const, title: 'Успешно!', message: 'Операция выполнена успешно' },
    { type: 'error' as const, title: 'Ошибка', message: 'Произошла ошибка при выполнении операции' },
    { type: 'warning' as const, title: 'Внимание', message: 'Обратите внимание на эту информацию' },
    { type: 'info' as const, title: 'Информация', message: 'Полезная информация для вас' },
    { type: 'favorite' as const, title: 'Добавлено в избранное', message: 'Место добавлено в ваш список избранного' },
    { type: 'review' as const, title: 'Отзыв добавлен', message: 'Ваш отзыв успешно опубликован' },
    { type: 'reply' as const, title: 'Получен ответ', message: 'На ваш отзыв ответили' },
    { type: 'reaction' as const, title: 'Реакция добавлена', message: 'Вы поставили лайк на отзыв' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 font-unbounded text-center">
          Тестирование дизайнов уведомлений
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Вариант 1 - Оригинальный */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">
              Вариант 1: Оригинальный
            </h2>
            <p className="text-gray-600 mb-6 font-unbounded">
              Классический дизайн с градиентами и анимациями
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {testNotifications.slice(0, 4).map((notif, index) => (
                <button
                  key={index}
                  onClick={() => addNotification(notif.type, notif.title, notif.message, 'v1')}
                  className={`px-4 py-2 rounded-lg text-sm font-unbounded transition-colors ${
                    notif.type === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    notif.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {notif.title}
                </button>
              ))}
            </div>
          </div>

          {/* Вариант 2 - Улучшенный с декорациями */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">
              Вариант 2: Улучшенный
            </h2>
            <p className="text-gray-600 mb-6 font-unbounded">
              Красивый дизайн с декоративными элементами и Unbounded шрифтом
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {testNotifications.slice(0, 4).map((notif, index) => (
                <button
                  key={index}
                  onClick={() => addNotification(notif.type, notif.title, notif.message, 'v2')}
                  className={`px-4 py-2 rounded-lg text-sm font-unbounded transition-colors ${
                    notif.type === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    notif.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {notif.title}
                </button>
              ))}
            </div>
          </div>

          {/* Вариант 3 - Минималистичный */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">
              Вариант 3: Минималистичный
            </h2>
            <p className="text-gray-600 mb-6 font-unbounded">
              Чистый дизайн с акцентом на типографику
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {testNotifications.slice(0, 4).map((notif, index) => (
                <button
                  key={index}
                  onClick={() => addNotification(notif.type, notif.title, notif.message, 'v3')}
                  className={`px-4 py-2 rounded-lg text-sm font-unbounded transition-colors ${
                    notif.type === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    notif.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {notif.title}
                </button>
              ))}
            </div>
          </div>

          {/* Вариант 4 - Карточный */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">
              Вариант 4: Карточный
            </h2>
            <p className="text-gray-600 mb-6 font-unbounded">
              Яркий дизайн с акцентом на брендинг Kiddeo
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {testNotifications.slice(0, 4).map((notif, index) => (
                <button
                  key={index}
                  onClick={() => addNotification(notif.type, notif.title, notif.message, 'v4')}
                  className={`px-4 py-2 rounded-lg text-sm font-unbounded transition-colors ${
                    notif.type === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    notif.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                    notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {notif.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Дополнительные тесты */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">
            Дополнительные тесты
          </h2>
          <p className="text-gray-600 mb-6 font-unbounded">
            Тестируйте все варианты одновременно
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testNotifications.map((notif, index) => (
              <button
                key={index}
                onClick={() => {
                  addNotification(notif.type, notif.title, notif.message, 'v1')
                  addNotification(notif.type, notif.title, notif.message, 'v2')
                  addNotification(notif.type, notif.title, notif.message, 'v3')
                  addNotification(notif.type, notif.title, notif.message, 'v4')
                }}
                className={`px-4 py-2 rounded-lg text-sm font-unbounded transition-colors ${
                  notif.type === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                  notif.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                  notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                  notif.type === 'favorite' ? 'bg-pink-100 text-pink-800 hover:bg-pink-200' :
                  notif.type === 'review' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                  notif.type === 'reply' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                  notif.type === 'reaction' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                  'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {notif.title}
              </button>
            ))}
          </div>
        </div>

        {/* Инструкции */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-800 mb-2 font-unbounded">Инструкции:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 font-unbounded">
            <li>• Нажмите на кнопки выше, чтобы создать уведомления</li>
            <li>• Уведомления появляются в правом верхнем углу (top-35)</li>
            <li>• Все варианты используют шрифт Unbounded</li>
            <li>• Уведомления автоматически исчезают через 5 секунд</li>
            <li>• Можно закрыть уведомление вручную кнопкой X</li>
          </ul>
        </div>
      </div>

      {/* Компоненты уведомлений */}
      <NotificationToast 
        notifications={notifications} 
        onRemove={(id) => removeNotification(id, 'v1')} 
      />
      <NotificationToastV2 
        notifications={notificationsV2} 
        onRemove={(id) => removeNotification(id, 'v2')} 
      />
      <NotificationToastV3 
        notifications={notificationsV3} 
        onRemove={(id) => removeNotification(id, 'v3')} 
      />
      <NotificationToastV4 
        notifications={notificationsV4} 
        onRemove={(id) => removeNotification(id, 'v4')} 
      />
    </div>
  )
}
