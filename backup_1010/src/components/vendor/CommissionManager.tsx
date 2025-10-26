// src/components/vendor/CommissionManager.tsx
"use client"

import { useState } from "react"
import { 
  Percent, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Info,
  Calculator,
  Receipt
} from "lucide-react"

interface Commission {
  id: number
  listingId: number
  listingTitle: string
  category: string
  percent: number
  fixedAmount?: number
  effectiveFrom: Date
  isActive: boolean
  approvedBy?: string
  approvedAt?: Date
}

interface CommissionManagerProps {
  commissions: Commission[]
  onUpdateCommission: (id: number, data: Partial<Commission>) => void
  onCreateCommission: (data: Omit<Commission, 'id'>) => void
}

export default function CommissionManager({ 
  commissions, 
  onUpdateCommission, 
  onCreateCommission 
}: CommissionManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null)
  const [formData, setFormData] = useState({
    listingId: '',
    percent: 15,
    fixedAmount: '',
    effectiveFrom: new Date().toISOString().split('T')[0]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const calculateCommission = (amount: number, percent: number, fixedAmount?: number) => {
    if (fixedAmount) {
      return fixedAmount
    }
    return Math.round(amount * (percent / 100))
  }

  const handleCreateCommission = () => {
    onCreateCommission({
      listingId: parseInt(formData.listingId),
      listingTitle: '', // Will be filled by parent
      category: '', // Will be filled by parent
      percent: formData.percent,
      fixedAmount: formData.fixedAmount ? parseInt(formData.fixedAmount) : undefined,
      effectiveFrom: new Date(formData.effectiveFrom),
      isActive: true
    })
    setShowCreateModal(false)
    setFormData({
      listingId: '',
      percent: 15,
      fixedAmount: '',
      effectiveFrom: new Date().toISOString().split('T')[0]
    })
  }

  const handleEditCommission = () => {
    if (editingCommission) {
      onUpdateCommission(editingCommission.id, {
        percent: formData.percent,
        fixedAmount: formData.fixedAmount ? parseInt(formData.fixedAmount) : undefined,
        effectiveFrom: new Date(formData.effectiveFrom)
      })
      setEditingCommission(null)
      setFormData({
        listingId: '',
        percent: 15,
        fixedAmount: '',
        effectiveFrom: new Date().toISOString().split('T')[0]
      })
    }
  }

  const openEditModal = (commission: Commission) => {
    setEditingCommission(commission)
    setFormData({
      listingId: commission.listingId.toString(),
      percent: commission.percent,
      fixedAmount: commission.fixedAmount?.toString() || '',
      effectiveFrom: commission.effectiveFrom.toISOString().split('T')[0]
    })
  }

  const totalCommissions = commissions.reduce((sum, commission) => {
    // Примерный расчет - в реальности нужно учитывать фактические продажи
    const estimatedRevenue = 10000 // Заглушка
    return sum + calculateCommission(estimatedRevenue, commission.percent, commission.fixedAmount)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление комиссиями</h2>
          <p className="text-gray-600">Настройте комиссии для ваших объявлений</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Settings className="w-5 h-5 mr-2" />
          Настроить комиссию
        </button>
      </div>

      {/* Статистика комиссий */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Активных комиссий</p>
              <p className="text-2xl font-bold text-gray-900">
                {commissions.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Средняя комиссия</p>
              <p className="text-2xl font-bold text-gray-900">
                {commissions.length > 0 
                  ? `${(commissions.reduce((sum, c) => sum + c.percent, 0) / commissions.length).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общая комиссия</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalCommissions)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Список комиссий */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Настроенные комиссии</h3>
        </div>

        {commissions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Нет настроенных комиссий</h4>
            <p className="text-gray-600 mb-4">Настройте комиссии для ваших объявлений</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Настроить первую комиссию
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {commissions.map((commission) => (
              <div key={commission.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{commission.listingTitle}</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {commission.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        commission.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {commission.isActive ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Percent className="w-4 h-4 mr-1" />
                        <span>
                          {commission.fixedAmount 
                            ? `Фиксированная: ${formatCurrency(commission.fixedAmount)}`
                            : `Процентная: ${commission.percent}%`
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Действует с: {formatDate(commission.effectiveFrom)}</span>
                      </div>
                      
                      {commission.approvedBy && (
                        <div className="flex items-center">
                          <span>Утверждено: {commission.approvedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => openEditModal(commission)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                    >
                      Редактировать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Информация о комиссиях */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Как работают комиссии</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Комиссия взимается с каждой успешной продажи</li>
              <li>• Можно настроить процентную или фиксированную комиссию</li>
              <li>• Комиссия рассчитывается автоматически при оплате</li>
              <li>• Выплаты производятся еженедельно</li>
              <li>• Минимальная комиссия: 5%, максимальная: 30%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Модальное окно создания/редактирования */}
      {(showCreateModal || editingCommission) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCommission ? 'Редактировать комиссию' : 'Настроить комиссию'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID объявления
                </label>
                <input
                  type="number"
                  value={formData.listingId}
                  onChange={(e) => setFormData(prev => ({ ...prev, listingId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите ID объявления"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Процент комиссии (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={formData.percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, percent: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фиксированная сумма (руб.) - опционально
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.fixedAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, fixedAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Оставьте пустым для процентной комиссии"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата вступления в силу
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingCommission(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={editingCommission ? handleEditCommission : handleCreateCommission}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingCommission ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
