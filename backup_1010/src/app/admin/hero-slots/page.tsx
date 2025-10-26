'use client'

import { useState, useEffect } from 'react'

interface HeroSlot {
  id: string
  city: string
  eventIds: string
  startDate: string
  endDate: string
  rotationFrequency: number
  isActive: boolean
  clickCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface AfishaEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  coverImage?: string
  venue?: string
}

export default function HeroSlotsPage() {
  const [heroSlots, setHeroSlots] = useState<HeroSlot[]>([])
  const [events, setEvents] = useState<AfishaEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data...')
        
        // Загружаем hero slots
        const heroResponse = await fetch('/api/admin/hero-slots?key=kidsreview2025')
        if (heroResponse.ok) {
          const heroData = await heroResponse.json()
          console.log('Hero slots loaded:', heroData.length)
          setHeroSlots(heroData)
        }

        // Загружаем events
        const eventsResponse = await fetch('/api/admin/afisha/events?key=kidsreview2025')
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          console.log('Events loaded:', eventsData.length)
          setEvents(eventsData)
        }

        console.log('Data loading completed')
        setLoading(false)
    } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Херо-блок</h1>
              <p className="text-gray-600 mt-1">Управление рекламными слотами в блоке категорий</p>
            </div>
          </div>
        </div>

        {/* Hero Slots Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Слоты ({heroSlots.length})</h2>
          </div>
          
          {heroSlots.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Нет слотов для отображения
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Город
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      События
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Период
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Частота
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статистика
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {heroSlots.map((slot) => {
                    // Парсим eventIds
                    let eventIds = []
                    try {
                      const cleanedEventIds = slot.eventIds.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
                      eventIds = JSON.parse(cleanedEventIds)
                    } catch (error) {
                      console.error('Error parsing eventIds:', error)
                      eventIds = []
                    }
                    const slotEvents = events.filter(event => eventIds.includes(event.id))
                    
                    return (
                      <tr key={slot.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {slot.city}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs">
                            {slotEvents.map(event => (
                              <div key={event.id} className="truncate">{event.title}</div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{new Date(slot.startDate).toLocaleDateString('ru-RU')}</div>
                            <div>{new Date(slot.endDate).toLocaleDateString('ru-RU')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {slot.rotationFrequency}/10
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>Показы: {slot.viewCount}</div>
                            <div>Клики: {slot.clickCount}</div>
                            <div>CTR: {slot.viewCount > 0 ? ((slot.clickCount / slot.viewCount) * 100).toFixed(1) : 0}%</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              slot.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.isActive ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}