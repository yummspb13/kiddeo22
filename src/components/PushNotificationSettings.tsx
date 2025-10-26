'use client'

import { useState } from 'react'
import { Bell, BellOff, Settings, Check, X } from 'lucide-react'
import { usePushNotifications } from '@/utils/push-notifications'

interface PushNotificationSettingsProps {
  onClose?: () => void
  className?: string
}

export default function PushNotificationSettings({ 
  onClose, 
  className = '' 
}: PushNotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe
  } = usePushNotifications()

  const [isRequesting, setIsRequesting] = useState(false)

  const handleToggleNotifications = async () => {
    if (!isSupported) return

    setIsRequesting(true)
    try {
      if (permission === 'default') {
        const granted = await requestPermission()
        if (granted) {
          await subscribe()
        }
      } else if (isSubscribed) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error)
    } finally {
      setIsRequesting(false)
    }
  }

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-3">
          <BellOff className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Push-уведомления не поддерживаются</h3>
            <p className="text-sm text-yellow-700">
              Ваш браузер не поддерживает push-уведомления
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusText = () => {
    if (permission === 'denied') {
      return 'Уведомления заблокированы'
    }
    if (permission === 'default') {
      return 'Разрешить уведомления'
    }
    if (isSubscribed) {
      return 'Уведомления включены'
    }
    return 'Уведомления отключены'
  }

  const getStatusColor = () => {
    if (permission === 'denied') {
      return 'text-red-600'
    }
    if (isSubscribed) {
      return 'text-green-600'
    }
    return 'text-gray-600'
  }

  const getButtonText = () => {
    if (permission === 'denied') {
      return 'Заблокировано'
    }
    if (permission === 'default') {
      return 'Разрешить'
    }
    if (isSubscribed) {
      return 'Отключить'
    }
    return 'Включить'
  }

  const isButtonDisabled = permission === 'denied' || isRequesting || isLoading

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Push-уведомления</h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleToggleNotifications}
          disabled={isButtonDisabled}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            isButtonDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isSubscribed
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {isRequesting || isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Обработка...</span>
            </>
          ) : (
            <>
              {isSubscribed ? (
                <BellOff className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              <span>{getButtonText()}</span>
            </>
          )}
        </button>

        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Уведомления заблокированы в настройках браузера. 
              Разрешите их в настройках сайта, чтобы получать уведомления.
            </p>
          </div>
        )}

        {isSubscribed && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Вы будете получать:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Новые события в избранных категориях</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Обновления заказов</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Напоминания о событиях</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Специальные предложения</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
