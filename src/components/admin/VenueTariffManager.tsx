'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CreditCard, History, Settings, X, Check, AlertTriangle } from 'lucide-react'

interface VenueTariffManagerProps {
  venueId: number
  venueName: string
  onClose: () => void
  onUpdate: () => void
}

interface VenueData {
  id: number
  name: string
  tariff: string
  tariffExpiresAt: string | null
  tariffAutoRenew: boolean
  tariffGracePeriodEndsAt: string | null
  tariffPrice: number | null
  createdAt: string
  vendor: {
    id: number
    displayName: string
    user: {
      email: string
      name: string
    }
  }
}

interface TariffHistoryItem {
  id: number
  tariff: string
  startedAt: string
  endedAt: string | null
  price: number | null
  autoRenewed: boolean
  cancelledByUser: {
    id: number
    name: string
    email: string
  } | null
}

interface TariffData {
  venue: VenueData
  tariffHistory: TariffHistoryItem[]
}

const TARIFF_LABELS = {
  FREE: 'Бесплатный',
  SUPER: 'Супер',
  MAXIMUM: 'Максимум'
}

const TARIFF_COLORS = {
  FREE: 'bg-gray-100 text-gray-800',
  SUPER: 'bg-blue-100 text-blue-800',
  MAXIMUM: 'bg-purple-100 text-purple-800'
}

export default function VenueTariffManager({ venueId, venueName, onClose, onUpdate }: VenueTariffManagerProps) {
  const [data, setData] = useState<TariffData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'manage' | 'history'>('manage')
  
  // Форма управления тарифом
  const [formData, setFormData] = useState({
    tariff: 'FREE',
    expiresAt: '',
    autoRenew: false,
    price: 0
  })

  useEffect(() => {
    loadData()
  }, [venueId])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/venues/${venueId}/tariff`)
      if (!response.ok) {
        throw new Error('Failed to load tariff data')
      }
      const result = await response.json()
      setData(result)
      
      // Заполняем форму текущими данными
      setFormData({
        tariff: result.venue.tariff,
        expiresAt: result.venue.tariffExpiresAt ? new Date(result.venue.tariffExpiresAt).toISOString().slice(0, 16) : '',
        autoRenew: result.venue.tariffAutoRenew,
        price: result.venue.tariffPrice || 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/venues/${venueId}/tariff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tariff: formData.tariff,
          expiresAt: formData.expiresAt || null,
          autoRenew: formData.autoRenew,
          price: formData.price || null,
          reason: 'Admin tariff change'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update tariff')
      }

      await loadData()
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/venues/${venueId}/tariff`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel tariff')
      }

      await loadData()
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel tariff')
    } finally {
      setSaving(false)
    }
  }

  const getTariffStatus = () => {
    if (!data) return null

    const now = new Date()
    const expiresAt = data.venue.tariffExpiresAt ? new Date(data.venue.tariffExpiresAt) : null
    const gracePeriodEnds = data.venue.tariffGracePeriodEndsAt ? new Date(data.venue.tariffGracePeriodEndsAt) : null

    if (data.venue.tariff === 'FREE') {
      return { status: 'free', message: 'Бесплатный тариф' }
    }

    if (gracePeriodEnds && now < gracePeriodEnds) {
      const daysLeft = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { status: 'grace', message: `Grace period: ${daysLeft} дней` }
    }

    if (expiresAt && now > expiresAt) {
      return { status: 'expired', message: 'Тариф истек' }
    }

    if (expiresAt) {
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { status: 'active', message: `Активен: ${daysLeft} дней` }
    }

    return { status: 'active', message: 'Активен' }
  }

  const tariffStatus = getTariffStatus()

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Загрузка...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>Ошибка загрузки данных</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Управление тарифом</h2>
            <p className="text-gray-600">{data.venue.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'manage'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Управление
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="h-4 w-4 inline mr-2" />
            История
          </button>
        </div>

        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Текущий статус</h3>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  TARIFF_COLORS[data.venue.tariff as keyof typeof TARIFF_COLORS]
                }`}>
                  {TARIFF_LABELS[data.venue.tariff as keyof typeof TARIFF_LABELS]}
                </span>
                {tariffStatus && (
                  <span className={`text-sm ${
                    tariffStatus.status === 'expired' ? 'text-red-600' :
                    tariffStatus.status === 'grace' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {tariffStatus.message}
                  </span>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тариф
                </label>
                <select
                  value={formData.tariff}
                  onChange={(e) => setFormData({ ...formData, tariff: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FREE">Бесплатный</option>
                  <option value="SUPER">Супер (690₽/мес)</option>
                  <option value="MAXIMUM">Максимум (1290₽/мес)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (руб.)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Дата истечения
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRenew" className="ml-2 text-sm text-gray-700">
                  Автопродление
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>

              {data.venue.tariff !== 'FREE' && (
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4 mr-2" />
                  Отменить тариф
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-medium">История изменений тарифа</h3>
            {data.tariffHistory.length === 0 ? (
              <p className="text-gray-500">История изменений отсутствует</p>
            ) : (
              <div className="space-y-3">
                {data.tariffHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          TARIFF_COLORS[item.tariff as keyof typeof TARIFF_COLORS]
                        }`}>
                          {TARIFF_LABELS[item.tariff as keyof typeof TARIFF_LABELS]}
                        </span>
                        {item.price && (
                          <span className="text-sm text-gray-600">{item.price}₽</span>
                        )}
                        {item.autoRenewed && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Автопродление
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.startedAt).toLocaleDateString('ru-RU')}
                        {item.endedAt && (
                          <span> - {new Date(item.endedAt).toLocaleDateString('ru-RU')}</span>
                        )}
                      </div>
                    </div>
                    {item.cancelledByUser && (
                      <p className="text-xs text-gray-500 mt-2">
                        Отменен: {item.cancelledByUser.name} ({item.cancelledByUser.email})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
