// src/components/vendor/TariffSelector.tsx
"use client"

import { useState } from "react"
import { Check, Star, Zap, Crown } from "lucide-react"

interface TariffPlan {
  id: number
  name: string
  tariff: 'FREE' | 'BASIC' | 'PREMIUM'
  price: number // в копейках
  features: string[]
  maxListings?: number
  isPopular?: boolean
}

interface TariffSelectorProps {
  plans: TariffPlan[]
  currentPlanId?: number
  onSelectPlan: (planId: number) => void
  loading?: boolean
}

const TARIFF_ICONS = {
  FREE: <Zap className="w-6 h-6" />,
  BASIC: <Star className="w-6 h-6" />,
  PREMIUM: <Crown className="w-6 h-6" />
}

const TARIFF_COLORS = {
  FREE: 'border-gray-200 bg-gray-50',
  BASIC: 'border-blue-200 bg-blue-50',
  PREMIUM: 'border-purple-200 bg-purple-50'
}

const TARIFF_BUTTON_COLORS = {
  FREE: 'bg-gray-600 hover:bg-gray-700',
  BASIC: 'bg-blue-600 hover:bg-blue-700',
  PREMIUM: 'bg-purple-600 hover:bg-purple-700'
}

export default function TariffSelector({ 
  plans, 
  currentPlanId, 
  onSelectPlan, 
  loading = false 
}: TariffSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(currentPlanId || null)

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно'
    return `${(price / 100).toLocaleString('ru-RU')} ₽/мес`
  }

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId)
    onSelectPlan(planId)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Выберите тариф</h2>
        <p className="text-gray-600">
          Подберите план, который подходит вашему бизнесу
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 p-6 transition-all ${
              selectedPlan === plan.id
                ? 'ring-2 ring-blue-500 ring-offset-2'
                : 'hover:shadow-lg'
            } ${TARIFF_COLORS[plan.tariff]}`}
          >
            {/* Популярный план */}
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Популярный
                </span>
              </div>
            )}

            {/* Иконка и название */}
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                plan.tariff === 'FREE' ? 'bg-gray-100 text-gray-600' :
                plan.tariff === 'BASIC' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {TARIFF_ICONS[plan.tariff]}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
              </div>
            </div>

            {/* Лимит листингов */}
            {plan.maxListings && (
              <div className="text-center mb-4">
                <span className="text-sm text-gray-600">
                  До {plan.maxListings} объявлений
                </span>
              </div>
            )}

            {/* Список возможностей */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Кнопка выбора */}
            <button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loading || selectedPlan === plan.id}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                selectedPlan === plan.id
                  ? 'bg-gray-400 cursor-not-allowed'
                  : TARIFF_BUTTON_COLORS[plan.tariff]
              }`}
            >
              {loading ? 'Обрабатываем...' : 
               selectedPlan === plan.id ? 'Выбран' : 
               'Выбрать план'}
            </button>
          </div>
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Что включено во все тарифы:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Создание и управление объявлениями</li>
          <li>• Базовая аналитика просмотров</li>
          <li>• Поддержка клиентов</li>
          <li>• Мобильное приложение</li>
        </ul>
      </div>

      {/* Информация о комиссии */}
      <div className="text-center text-sm text-gray-500">
        <p>
          * Комиссия с продаж: 5-15% в зависимости от категории и тарифа
        </p>
        <p>
          ** Все цены указаны с НДС
        </p>
      </div>
    </div>
  )
}
