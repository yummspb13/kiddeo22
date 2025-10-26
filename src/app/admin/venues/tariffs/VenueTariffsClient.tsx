'use client'

import { useState, useEffect } from 'react'
import { Settings, Eye, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import VenueTariffManager from '@/components/admin/VenueTariffManager'

interface Venue {
  id: number
  name: string
  slug: string
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

export default function VenueTariffsClient() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [stats, setStats] = useState({
    free: 0,
    optimal: 0,
    expiring: 0,
    grace: 0
  })

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/venues')
      if (!response.ok) {
        throw new Error('Failed to load venues')
      }
      const data = await response.json()
      setVenues(data.venues || [])
      
      // Обновляем статистику
      updateStats(data.venues || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load venues')
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (venuesData: Venue[]) => {
    const now = new Date()
    const newStats = {
      free: 0,
      optimal: 0,
      expiring: 0,
      grace: 0
    }

    venuesData.forEach(venue => {
      if (venue.tariff === 'FREE') {
        newStats.free++
      } else if (venue.tariff === 'SUPER') {
        newStats.optimal++
      }

      // Проверяем истекающие тарифы (7 дней)
      if (venue.tariffExpiresAt) {
        const expiresAt = new Date(venue.tariffExpiresAt)
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          newStats.expiring++
        }
      }

      // Проверяем grace period
      if (venue.tariffGracePeriodEndsAt) {
        const graceEnds = new Date(venue.tariffGracePeriodEndsAt)
        if (now < graceEnds) {
          newStats.grace++
        }
      }
    })

    setStats(newStats)
    
    // Обновляем DOM элементы
    const freeCountEl = document.getElementById('free-count')
    const optimalCountEl = document.getElementById('optimal-count')
    const expiringCountEl = document.getElementById('expiring-count')
    const graceCountEl = document.getElementById('grace-count')
    
    if (freeCountEl) freeCountEl.textContent = newStats.free.toString()
    if (optimalCountEl) optimalCountEl.textContent = newStats.optimal.toString()
    if (expiringCountEl) expiringCountEl.textContent = newStats.expiring.toString()
    if (graceCountEl) graceCountEl.textContent = newStats.grace.toString()
  }

  const getTariffStatus = (venue: Venue) => {
    const now = new Date()
    const expiresAt = venue.tariffExpiresAt ? new Date(venue.tariffExpiresAt) : null
    const gracePeriodEnds = venue.tariffGracePeriodEndsAt ? new Date(venue.tariffGracePeriodEndsAt) : null

    if (venue.tariff === 'FREE') {
      return { status: 'free', message: 'Бесплатный', icon: CheckCircle, color: 'text-gray-600' }
    }

    if (gracePeriodEnds && now < gracePeriodEnds) {
      const daysLeft = Math.ceil((gracePeriodEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { status: 'grace', message: `Grace: ${daysLeft}д`, icon: AlertTriangle, color: 'text-red-600' }
    }

    if (expiresAt && now > expiresAt) {
      return { status: 'expired', message: 'Истек', icon: AlertTriangle, color: 'text-red-600' }
    }

    if (expiresAt) {
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 7) {
        return { status: 'expiring', message: `${daysLeft}д`, icon: Clock, color: 'text-orange-600' }
      }
      return { status: 'active', message: `${daysLeft}д`, icon: CheckCircle, color: 'text-green-600' }
    }

    return { status: 'active', message: 'Активен', icon: CheckCircle, color: 'text-green-600' }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Загрузка мест...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
          <button
            onClick={loadVenues}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Места и тарифы</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Место
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Вендор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тариф
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Истекает
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {venues.map((venue) => {
                const tariffStatus = getTariffStatus(venue)
                const StatusIcon = tariffStatus.icon
                
                return (
                  <tr key={venue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                        <div className="text-sm text-gray-500">/{venue.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{venue.vendor.displayName}</div>
                        <div className="text-sm text-gray-500">{venue.vendor.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        TARIFF_COLORS[venue.tariff as keyof typeof TARIFF_COLORS]
                      }`}>
                        {TARIFF_LABELS[venue.tariff as keyof typeof TARIFF_LABELS]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className={`h-4 w-4 mr-2 ${tariffStatus.color}`} />
                        <span className={`text-sm ${tariffStatus.color}`}>
                          {tariffStatus.message}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(venue.tariffExpiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venue.tariffPrice ? `${venue.tariffPrice}₽` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedVenue(venue)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Управление
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVenue && (
        <VenueTariffManager
          venueId={selectedVenue.id}
          venueName={selectedVenue.name}
          onClose={() => setSelectedVenue(null)}
          onUpdate={() => {
            setSelectedVenue(null)
            loadVenues()
          }}
        />
      )}
    </>
  )
}
