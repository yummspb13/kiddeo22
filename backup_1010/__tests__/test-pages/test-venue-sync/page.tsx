'use client'

import { useState, useEffect } from 'react'

export default function TestVenueSyncPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [venuePartnerId, setVenuePartnerId] = useState<string>('')
  const [stats, setStats] = useState<any>(null)

  // Загружаем статистику при загрузке страницы
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/venues/sync?key=kidsreview2025')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    }
  }

  const handleSyncAll = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/admin/venues/sync?key=kidsreview2025', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'sync-all' })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ ${data.message}`)
        loadStats() // Обновляем статистику
      } else {
        setResult(`❌ Ошибка: ${data.error || data.details}`)
      }
    } catch (error) {
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncSingle = async () => {
    if (!venuePartnerId) {
      setResult('❌ Введите ID VenuePartner')
      return
    }

    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/admin/venues/sync?key=kidsreview2025', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'sync-single', 
          venuePartnerId: parseInt(venuePartnerId) 
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ ${data.message}`)
        loadStats() // Обновляем статистику
      } else {
        setResult(`❌ Ошибка: ${data.error || data.details}`)
      }
    } catch (error) {
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Тест синхронизации VenuePartner ↔ Listing
          </h1>

          <div className="space-y-6">
            {/* Синхронизация всех активных VenuePartner */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Синхронизация всех активных VenuePartner
              </h2>
              <p className="text-gray-600 mb-4">
                Создаст или обновит все Listing для VenuePartner со статусом ACTIVE
              </p>
              <button
                onClick={handleSyncAll}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Синхронизация...' : 'Синхронизировать все'}
              </button>
            </div>

            {/* Синхронизация конкретного VenuePartner */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Синхронизация конкретного VenuePartner
              </h2>
              <p className="text-gray-600 mb-4">
                Синхронизирует конкретный VenuePartner с Listing
              </p>
              <div className="flex space-x-3">
                <input
                  type="number"
                  value={venuePartnerId}
                  onChange={(e) => setVenuePartnerId(e.target.value)}
                  placeholder="ID VenuePartner"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSyncSingle}
                  disabled={loading || !venuePartnerId}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Синхронизация...' : 'Синхронизировать'}
                </button>
              </div>
            </div>

            {/* Статистика */}
            {stats && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Статистика синхронизации:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">VenuePartner:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Активные:</span>
                        <span className="font-medium text-green-600">{stats.venuePartnerStats.ACTIVE || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>На модерации:</span>
                        <span className="font-medium text-yellow-600">{stats.venuePartnerStats.MODERATION || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Скрытые:</span>
                        <span className="font-medium text-gray-600">{stats.venuePartnerStats.HIDDEN || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Listing:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Места:</span>
                        <span className="font-medium text-blue-600">{stats.listingStats.VENUE || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Услуги:</span>
                        <span className="font-medium text-blue-600">{stats.listingStats.SERVICE || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Не синхронизированы:</span>
                        <span className="font-medium text-red-600">{stats.unsyncedCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {stats.unsyncedVenuePartners && stats.unsyncedVenuePartners.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Не синхронизированные VenuePartner:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {stats.unsyncedVenuePartners.map((vp: any) => (
                        <div key={vp.id} className="flex justify-between">
                          <span>{vp.name}</span>
                          <span className="text-gray-400">ID: {vp.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Результат */}
            {result && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Результат:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
              </div>
            )}

            {/* Информация о синхронизации */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Как работает синхронизация:
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>ACTIVE</strong> → создает или обновляет Listing</li>
                <li>• <strong>HIDDEN</strong> → удаляет Listing</li>
                <li>• <strong>MODERATION</strong> → удаляет Listing (не показываем на модерации)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
