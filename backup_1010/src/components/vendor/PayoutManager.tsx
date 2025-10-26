// src/components/vendor/PayoutManager.tsx
"use client"

import { useState } from "react"
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Calendar,
  Banknote,
  AlertCircle
} from "lucide-react"

interface Payout {
  id: number
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  method: string
  details: {
    accountNumber?: string
    bankName?: string
    cardNumber?: string
    phoneNumber?: string
  }
  processedAt?: Date
  createdAt: Date
  description: string
}

interface PayoutManagerProps {
  payouts: Payout[]
  balance: number
  onRequestPayout: (amount: number, method: string, details: unknown) => void
  onUpdatePayoutDetails: (id: number, details: unknown) => void
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
}

const STATUS_ICONS = {
  PENDING: <Clock className="w-4 h-4" />,
  PROCESSING: <CreditCard className="w-4 h-4" />,
  COMPLETED: <CheckCircle className="w-4 h-4" />,
  FAILED: <XCircle className="w-4 h-4" />,
  CANCELLED: <XCircle className="w-4 h-4" />
}

const STATUS_LABELS = {
  PENDING: 'Ожидает обработки',
  PROCESSING: 'Обрабатывается',
  COMPLETED: 'Выплачено',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменено'
}

export default function PayoutManager({ 
  payouts, 
  balance, 
  onRequestPayout, 
  onUpdatePayoutDetails 
}: PayoutManagerProps) {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer',
    accountNumber: '',
    bankName: '',
    cardNumber: '',
    phoneNumber: ''
  })

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRequestPayout = () => {
    const amount = parseInt(formData.amount) * 100 // Конвертируем в копейки
    const details = {
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      cardNumber: formData.cardNumber,
      phoneNumber: formData.phoneNumber
    }
    
    onRequestPayout(amount, formData.method, details)
    setShowRequestModal(false)
    setFormData({
      amount: '',
      method: 'bank_transfer',
      accountNumber: '',
      bankName: '',
      cardNumber: '',
      phoneNumber: ''
    })
  }

  const openDetailsModal = (payout: Payout) => {
    setSelectedPayout(payout)
    setShowDetailsModal(true)
  }

  const totalPayouts = payouts.reduce((sum, payout) => {
    return payout.status === 'COMPLETED' ? sum + payout.amount : sum
  }, 0)

  const pendingPayouts = payouts.filter(payout => 
    payout.status === 'PENDING' || payout.status === 'PROCESSING'
  ).reduce((sum, payout) => sum + payout.amount, 0)

  const availableBalance = balance - pendingPayouts

  return (
    <div className="space-y-6">
      {/* Заголовок и баланс */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Выплаты</h2>
          <p className="text-gray-600">Управляйте выплатами и балансом</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          disabled={availableBalance < 1000} // Минимум 10 рублей
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Banknote className="w-5 h-5 mr-2" />
          Запросить выплату
        </button>
      </div>

      {/* Баланс и статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Доступный баланс</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">В обработке</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingPayouts)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Выплачено</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayouts)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего выплат</p>
              <p className="text-2xl font-bold text-gray-900">{payouts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* История выплат */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">История выплат</h3>
        </div>

        {payouts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Нет выплат</h4>
            <p className="text-gray-600">Выплаты появятся здесь после запроса</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payouts.map((payout) => (
              <div key={payout.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {formatCurrency(payout.amount)}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payout.status]}`}>
                        {STATUS_ICONS[payout.status]}
                        <span className="ml-1">{STATUS_LABELS[payout.status]}</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {payout.method === 'bank_transfer' ? 'Банковский перевод' :
                         payout.method === 'card' ? 'На карту' :
                         payout.method === 'wallet' ? 'Электронный кошелек' : payout.method}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Создано: {formatDate(payout.createdAt)}</span>
                      </div>
                      
                      {payout.processedAt && (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Обработано: {formatDate(payout.processedAt)}</span>
                        </div>
                      )}
                    </div>

                    {payout.description && (
                      <p className="text-sm text-gray-600 mt-1">{payout.description}</p>
                    )}
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => openDetailsModal(payout)}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
                    >
                      Детали
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно запроса выплаты */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Запросить выплату</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма (руб.)
                </label>
                <input
                  type="number"
                  min="10"
                  max={Math.floor(availableBalance / 100)}
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Минимум 10 рублей"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Доступно: {formatCurrency(availableBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Способ выплаты
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank_transfer">Банковский перевод</option>
                  <option value="card">На карту</option>
                  <option value="wallet">Электронный кошелек</option>
                </select>
              </div>

              {formData.method === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Номер счета
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="20-значный номер счета"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название банка
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Сбербанк"
                    />
                  </div>
                </>
              )}

              {formData.method === 'card' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Номер карты
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
              )}

              {formData.method === 'wallet' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Номер телефона
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleRequestPayout}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Запросить выплату
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно деталей выплаты */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Детали выплаты</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Сумма</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedPayout.amount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedPayout.status]}`}>
                  {STATUS_ICONS[selectedPayout.status]}
                  <span className="ml-1">{STATUS_LABELS[selectedPayout.status]}</span>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Способ выплаты</label>
                <p className="text-gray-900">{selectedPayout.method}</p>
              </div>

              {selectedPayout.details.accountNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Номер счета</label>
                  <p className="text-gray-900 font-mono">{selectedPayout.details.accountNumber}</p>
                </div>
              )}

              {selectedPayout.details.bankName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Банк</label>
                  <p className="text-gray-900">{selectedPayout.details.bankName}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Дата создания</label>
                <p className="text-gray-900">{formatDate(selectedPayout.createdAt)}</p>
              </div>

              {selectedPayout.processedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Дата обработки</label>
                  <p className="text-gray-900">{formatDate(selectedPayout.processedAt)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
