'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, CreditCard, X, CheckCircle } from 'lucide-react'
import { getTariffStatus, getTariffLabel, getTariffColor, type VenueTariffData } from '@/lib/tariff-utils'

interface TariffNotificationProps {
  venueData: VenueTariffData
  onUpgrade?: () => void
  onDismiss?: () => void
}

export default function TariffNotification({ venueData, onUpgrade, onDismiss }: TariffNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  const tariffStatus = getTariffStatus(venueData)

  useEffect(() => {
    // Проверяем, было ли уведомление уже отклонено
    const dismissedKey = `tariff-notification-${venueData.tariff}-dismissed`
    const wasDismissed = localStorage.getItem(dismissedKey)
    if (wasDismissed) {
      setDismissed(true)
      setIsVisible(false)
    }
  }, [venueData.tariff])

  const handleDismiss = () => {
    const dismissedKey = `tariff-notification-${venueData.tariff}-dismissed`
    localStorage.setItem(dismissedKey, 'true')
    setDismissed(true)
    setIsVisible(false)
    onDismiss?.()
  }

  const getNotificationConfig = () => {
    switch (tariffStatus.status) {
      case 'expiring':
        return {
          icon: Clock,
          title: 'Тариф истекает',
          message: `Ваш тариф "${getTariffLabel(venueData.tariff)}" истекает через ${tariffStatus.daysUntilExpiry} дней`,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          showUpgrade: true
        }
      case 'grace_period':
        return {
          icon: AlertTriangle,
          title: 'Grace period',
          message: `Тариф истек, у вас есть ${tariffStatus.gracePeriodDays} дней для продления`,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          showUpgrade: true
        }
      case 'expired':
        return {
          icon: AlertTriangle,
          title: 'Тариф истек',
          message: 'Тариф истек, функции ограничены. Обновите тариф для восстановления доступа',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          showUpgrade: true
        }
      case 'free':
        return {
          icon: CreditCard,
          title: 'Обновите тариф',
          message: 'Обновите тариф до "Супер" для получения дополнительных возможностей',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          showUpgrade: true
        }
      default:
        return null
    }
  }

  const config = getNotificationConfig()

  if (!config || !isVisible || dismissed) {
    return null
  }

  const IconComponent = config.icon

  return (
    <div className={`rounded-lg border ${config.bgColor} ${config.borderColor} p-4 mb-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.iconColor}`}>
            {config.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {config.message}
          </p>
          {config.showUpgrade && (
            <div className="mt-3 flex space-x-3">
              <button
                onClick={onUpgrade}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md ${config.buttonColor} transition-colors`}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Обновить тариф
              </button>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Скрыть
              </button>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Компонент для отображения статуса тарифа в дашборде
export function TariffStatusCard({ venueData }: { venueData: VenueTariffData }) {
  const tariffStatus = getTariffStatus(venueData)

  const getStatusConfig = () => {
    switch (tariffStatus.status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'expiring':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      case 'grace_period':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'expired':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'free':
        return {
          icon: CreditCard,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      default:
        return {
          icon: CheckCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div className={`rounded-lg border ${config.bgColor} ${config.borderColor} p-4`}>
      <div className="flex items-center">
        <IconComponent className={`h-5 w-5 ${config.color} mr-3`} />
        <div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
              getTariffColor(venueData.tariff)
            }`}>
              {getTariffLabel(venueData.tariff)}
            </span>
            <span className={`text-sm font-medium ${config.color}`}>
              {tariffStatus.message}
            </span>
          </div>
          {venueData.tariffPrice && (
            <p className="text-sm text-gray-600 mt-1">
              {venueData.tariffPrice}₽/месяц
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
