'use client'

import { useState } from 'react'
import { Lock, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import { getTariffLimits, getTariffUpgradeMessage, getTariffLabel, getTariffColor, type VenueTariff } from '@/lib/tariff-utils'

interface TariffRestrictionProps {
  currentTariff: VenueTariff
  feature: string
  children: React.ReactNode
  showUpgradeButton?: boolean
  onUpgrade?: () => void
}

export default function TariffRestriction({ 
  currentTariff, 
  feature, 
  children, 
  showUpgradeButton = true,
  onUpgrade 
}: TariffRestrictionProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const limits = getTariffLimits(currentTariff)
  const isAllowed = feature === 'richDescription' ? limits.hasRichDescription : (limits as Record<string, unknown>)[feature]
  const upgradeMessage = getTariffUpgradeMessage(currentTariff, feature)
  
  // Убираем отладочные логи

  if (isAllowed) {
    return <>{children}</>
  }

  return (
    <>
      <div className="relative">
        {/* Blurred content */}
        <div className="filter blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Overlay with restriction message */}
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <div className="text-center p-6 max-w-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Lock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Функция недоступна
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {upgradeMessage}
            </p>
            
            <div className="flex items-center justify-center mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getTariffColor(currentTariff)
              }`}>
                Текущий: {getTariffLabel(currentTariff)}
              </span>
            </div>
            
            {showUpgradeButton && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Обновить тариф
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Обновление тарифа
              </h3>
              
              <p className="text-gray-600 mb-6">
                Для использования функции &quot;{feature}&quot; необходимо обновить тариф до &quot;Супер&quot;
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Тариф &quot;Супер&quot; включает:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    10 фото (вместо 4)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    3 новости в месяц
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Расширенное описание
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Особенности с иконками
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Аналитика
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Поля цены и возраста
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 mb-2">690₽/месяц</p>
                <p className="text-sm text-gray-500">или 23₽/день</p>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    onUpgrade?.()
                    setShowUpgradeModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Обновить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
