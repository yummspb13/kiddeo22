'use client'

import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw, Home, Search, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Check initial status
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  if (isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Соединение восстановлено!
          </h1>
          <p className="text-gray-600 mb-6">
            Вы снова в сети. Перенаправляем вас на главную страницу...
          </p>
          <button
            onClick={handleGoHome}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Перейти на главную
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Нет соединения
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Проверьте подключение к интернету и попробуйте снова. 
          Некоторые функции могут быть доступны в офлайн режиме.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={retryCount >= 3}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4 flex items-center justify-center space-x-2"
        >
          <RefreshCw className={`w-5 h-5 ${retryCount > 0 ? 'animate-spin' : ''}`} />
          <span>
            {retryCount === 0 ? 'Попробовать снова' : 
             retryCount < 3 ? `Попробовать снова (${retryCount}/3)` : 
             'Слишком много попыток'}
          </span>
        </button>

        {/* Quick Actions */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            Попробуйте эти действия:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoHome}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Home className="w-6 h-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Главная</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/city/moscow/events'}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-6 h-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">События</span>
            </button>
          </div>
        </div>

        {/* Offline Features */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Доступно офлайн:
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Просмотр сохраненных событий</li>
            <li>• История заказов</li>
            <li>• Профиль пользователя</li>
            <li>• Избранные места</li>
          </ul>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500">
          <p>
            Если проблема повторяется, проверьте:
          </p>
          <ul className="mt-2 space-y-1">
            <li>• Подключение к Wi-Fi или мобильной сети</li>
            <li>• Настройки брандмауэра</li>
            <li>• Обновите страницу через несколько минут</li>
          </ul>
        </div>
      </div>
    </div>
  )
}