// src/components/vendor/PaymentManager.tsx
"use client"

import { useState } from "react"
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, X } from "lucide-react"

interface Payment {
  id: number
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  description: string
  createdAt: Date
  paidAt?: Date
  externalId?: string
}

interface Subscription {
  id: number
  planName: string
  tariff: 'FREE' | 'BASIC' | 'PREMIUM'
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'ACTIVE' | 'EXPIRED'
  amount: number
  startsAt: Date
  endsAt?: Date
  autoRenew: boolean
  nextPaymentAt?: Date
}

interface PaymentManagerProps {
  payments: Payment[]
  subscription: Subscription
  onUpgradePlan: (planId: number) => void
  onCancelSubscription: () => void
  onRenewSubscription: () => void
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-orange-100 text-orange-800'
}

const STATUS_ICONS = {
  PENDING: <Clock className="w-4 h-4" />,
  PAID: <CheckCircle className="w-4 h-4" />,
  FAILED: <X className="w-4 h-4" />,
  REFUNDED: <AlertCircle className="w-4 h-4" />,
  CANCELLED: <X className="w-4 h-4" />,
  ACTIVE: <CheckCircle className="w-4 h-4" />,
  EXPIRED: <AlertCircle className="w-4 h-4" />
}

const STATUS_LABELS = {
  PENDING: 'Ожидает оплаты',
  PAID: 'Оплачено',
  FAILED: 'Ошибка оплаты',
  REFUNDED: 'Возврат',
  CANCELLED: 'Отменено',
  ACTIVE: 'Активна',
  EXPIRED: 'Истекла'
}

export default function PaymentManager({ 
  payments, 
  subscription, 
  onUpgradePlan, 
  onCancelSubscription, 
  onRenewSubscription 
}: PaymentManagerProps) {
  const [activeTab, setActiveTab] = useState<'subscription' | 'payments' | 'billing'>('subscription')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount / 100)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600'
      case 'PENDING': return 'text-yellow-600'
      case 'FAILED': return 'text-red-600'
      case 'CANCELLED': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Платежи и подписки</h2>
        <p className="text-gray-600">Управляйте подпиской и просматривайте историю платежей</p>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'subscription', label: 'Подписка', icon: CreditCard },
            { id: 'payments', label: 'Платежи', icon: DollarSign },
            { id: 'billing', label: 'Выставление счетов', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Контент табов */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Текущая подписка */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Текущая подписка</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[subscription.status]}`}>
                {STATUS_LABELS[subscription.status]}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Тарифный план</p>
                <p className="text-lg font-semibold text-gray-900">{subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Стоимость</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(subscription.amount)}/мес</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Следующий платеж</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.nextPaymentAt ? formatDate(subscription.nextPaymentAt) : 'Не запланирован'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              {subscription.status === 'PAID' && (
                <>
                  <button
                    onClick={() => onUpgradePlan(2)} // ID базового плана
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Улучшить план
                  </button>
                  <button
                    onClick={onCancelSubscription}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Отменить подписку
                  </button>
                </>
              )}
              {subscription.status === 'CANCELLED' && (
                <button
                  onClick={onRenewSubscription}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Возобновить подписку
                </button>
              )}
            </div>
          </div>

          {/* Информация о тарифе */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Что включено в ваш тариф</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription.tariff === 'FREE' && (
                <>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">До 3 объявлений</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Базовая аналитика</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Поддержка по email</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Мобильное приложение</span>
                  </div>
                </>
              )}
              {subscription.tariff === 'BASIC' && (
                <>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">До 20 объявлений</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Расширенная аналитика</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Приоритетная поддержка</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Продвижение в поиске</span>
                  </div>
                </>
              )}
              {subscription.tariff === 'PREMIUM' && (
                <>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Безлимитные объявления</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Полная аналитика</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Персональный менеджер</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Топ-позиции в поиске</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* История платежей */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">История платежей</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Нет платежей</h4>
                  <p className="text-gray-600">Платежи появятся здесь после оплаты подписки</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-4 ${STATUS_COLORS[payment.status]}`}>
                          {STATUS_ICONS[payment.status]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                            {payment.paidAt && ` • Оплачено ${formatDate(payment.paidAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status]}`}>
                          {STATUS_LABELS[payment.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Настройки выставления счетов */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки выставления счетов</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email для счетов
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="billing@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Налоговый номер (ИНН)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Юридический адрес
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456, г. Москва, ул. Примерная, д. 1"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Сохранить настройки
              </button>
            </div>
          </div>

          {/* Интеграция с ЮКассой */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-2">Интеграция с ЮКассой</h4>
            <p className="text-blue-700 text-sm mb-4">
              Для настройки автоматических платежей необходимо подключить ЮКассу
            </p>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• Настройте webhook для уведомлений о платежах</p>
              <p>• Укажите URL для возврата после оплаты</p>
              <p>• Проверьте настройки безопасности</p>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Настроить ЮКассу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
