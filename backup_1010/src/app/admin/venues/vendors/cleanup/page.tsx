'use client'

import { useState, useEffect } from 'react'
import { useAdminKey } from '@/hooks/useAdminKey'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'

interface CleanupStats {
  totalInactiveVendors: number
  vendorsByDays: Record<number, any[]>
  cutoffDate: string
  vendors: Array<{
    id: number
    vendorId: number
    fullName: string
    createdAt: string
    daysSinceCreation: number
    daysUntilDeletion: number
  }>
}

interface CleanupResult {
  success: boolean
  message: string
  deletedVendors: unknown[]
  errors: unknown[]
  summary: {
    totalFound: number
    successfullyDeleted: number
    errors: number
  }
}

export default function VendorCleanupPage() {
  const { keySuffix } = useAdminKey()

  const [stats, setStats] = useState<CleanupStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/venues/vendors/cleanup')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching cleanup stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const runCleanup = async () => {
    setCleanupLoading(true)
    try {
      const response = await fetch('/api/admin/venues/vendors/cleanup', {
        method: 'POST'
      })
      const data = await response.json()
      setCleanupResult(data)
      // Обновляем статистику после очистки
      await fetchStats()
    } catch (error) {
      console.error('Error running cleanup:', error)
    } finally {
      setCleanupLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getDaysColor = (days: number) => {
    if (days <= 0) return 'text-red-600 bg-red-50'
    if (days <= 5) return 'text-red-600 bg-red-50'
    if (days <= 10) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getDaysIcon = (days: number) => {
    if (days <= 0) return <XCircle className="w-4 h-4" />
    if (days <= 5) return <AlertTriangle className="w-4 h-4" />
    if (days <= 10) return <Clock className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка статистики...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Очистка вендоров</h1>
        <p className="text-gray-600 mt-2">
          Автоматическое удаление вендоров, которые не создали партнеров в течение 30 дней
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Всего неактивных</h3>
          <div className="text-2xl font-bold text-gray-900">
            {stats?.totalInactiveVendors || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Критические (≤5 дней)</h3>
          <div className="text-2xl font-bold text-red-600">
            {stats?.vendors.filter(v => v.daysUntilDeletion <= 5).length || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Предупреждения (6-10 дней)</h3>
          <div className="text-2xl font-bold text-yellow-600">
            {stats?.vendors.filter(v => v.daysUntilDeletion > 5 && v.daysUntilDeletion <= 10).length || 0}
          </div>
        </div>
      </div>

      {/* Кнопка очистки */}
      <div className="mb-6">
        <button
          onClick={runCleanup}
          disabled={cleanupLoading || (stats?.totalInactiveVendors || 0) === 0}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {cleanupLoading ? 'Выполняется очистка...' : 'Запустить очистку'}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Будет удалено {stats?.totalInactiveVendors || 0} вендоров без партнеров
        </p>
      </div>

      {/* Результат очистки */}
      {cleanupResult && (
        <div className={`mb-6 p-4 rounded-lg border ${cleanupResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center">
            {cleanupResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 mr-2" />
            )}
            <span className={cleanupResult.success ? 'text-green-800' : 'text-red-800'}>
              {cleanupResult.message}
            </span>
          </div>
          {cleanupResult.summary && (
            <div className="mt-2 text-sm">
              <p>Найдено: {cleanupResult.summary.totalFound}</p>
              <p>Удалено: {cleanupResult.summary.successfullyDeleted}</p>
              <p>Ошибок: {cleanupResult.summary.errors}</p>
            </div>
          )}
        </div>
      )}

      {/* Список вендоров */}
      {stats && stats.vendors.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Вендоры к удалению</h2>
            <p className="text-sm text-gray-600 mt-1">
              Вендоры, которые будут удалены при следующей очистке
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{vendor.fullName}</h3>
                    <p className="text-sm text-gray-500">
                      Создан: {new Date(vendor.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Дней с создания: {vendor.daysSinceCreation}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDaysColor(vendor.daysUntilDeletion)}`}>
                      {getDaysIcon(vendor.daysUntilDeletion)}
                      <span className="ml-1">
                        {vendor.daysUntilDeletion <= 0 ? 'Удален' : `${vendor.daysUntilDeletion} дней`}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats && stats.vendors.length === 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет вендоров к удалению</h3>
            <p className="text-gray-500">
              Все вендоры активны или созданы недавно
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
