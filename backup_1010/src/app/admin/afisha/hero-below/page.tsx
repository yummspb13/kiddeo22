'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Eye, TrendingUp, Target, Edit, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react'

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

export default function HeroBelowPage() {
  const router = useRouter()
  const [heroSlots, setHeroSlots] = useState<HeroSlot[]>([])
  const [events, setEvents] = useState<AfishaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<HeroSlot | null>(null)

  // Форма создания/редактирования
  const [formData, setFormData] = useState({
    city: 'Москва',
    eventIds: [] as string[],
    startDate: '',
    endDate: '',
    rotationFrequency: 1,
    isActive: true
  })

  // Загрузка данных
  useEffect(() => {
    loadHeroSlots()
    loadEvents()
  }, [])

  const loadHeroSlots = async () => {
    try {
      const response = await fetch('/api/admin/hero-slots?key=kidsreview2025')
      if (response.ok) {
        const data = await response.json()
        setHeroSlots(data)
      } else {
        console.error('Failed to load hero slots:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading hero slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/admin/afisha/events?key=kidsreview2025')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        console.error('Failed to load events:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSlot ? `/api/admin/hero-slots/${editingSlot.id}` : '/api/admin/hero-slots'
      const method = editingSlot ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateForm(false)
        setEditingSlot(null)
        setFormData({
          city: 'Москва',
          eventIds: [],
          startDate: '',
          endDate: '',
          rotationFrequency: 1,
          isActive: true
        })
        loadHeroSlots()
      } else {
        console.error('Failed to save hero slot:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error saving hero slot:', error)
    }
  }

  const handleEdit = (slot: HeroSlot) => {
    setEditingSlot(slot)
    setFormData({
      city: slot.city,
      eventIds: JSON.parse(slot.eventIds),
      startDate: slot.startDate.split('T')[0],
      endDate: slot.endDate.split('T')[0],
      rotationFrequency: slot.rotationFrequency,
      isActive: slot.isActive
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот слот?')) {
      try {
        const response = await fetch(`/api/admin/hero-slots/${id}?key=kidsreview2025`, {
          method: 'DELETE'
        })
        if (response.ok) {
          loadHeroSlots()
        } else {
          console.error('Failed to delete hero slot:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error deleting hero slot:', error)
      }
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/hero-slots/${id}?key=kidsreview2025`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      if (response.ok) {
        loadHeroSlots()
      } else {
        console.error('Failed to toggle hero slot:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error toggling hero slot:', error)
    }
  }

  const getEventTitles = (eventIds: string | string[] | null | undefined) => {
    if (!eventIds) return []
    const ids = typeof eventIds === 'string' ? JSON.parse(eventIds) : eventIds
    return events.filter(event => ids.includes(event.id)).map(event => event.title)
  }

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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HERO_BELOW - Рекламные слоты</h1>
          <p className="mt-2 text-gray-600">Управление рекламными слотами для позиции HERO_BELOW</p>
        </div>

        {/* Кнопка создания */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowCreateForm(true)
              setEditingSlot(null)
              setFormData({
                city: 'Москва',
                eventIds: [],
                startDate: '',
                endDate: '',
                rotationFrequency: 1,
                isActive: true
              })
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Создать рекламный слот
          </button>
        </div>

        {/* Форма создания/редактирования */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingSlot ? 'Редактировать слот' : 'Создать новый слот'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Город
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Москва">Москва</option>
                    <option value="Санкт-Петербург">Санкт-Петербург</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Частотность показа (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rotationFrequency}
                    onChange={(e) => setFormData({ ...formData, rotationFrequency: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Мероприятия
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {events.map((event) => (
                    <label key={event.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.eventIds.includes(event.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, eventIds: [...formData.eventIds, event.id] })
                          } else {
                            setFormData({ ...formData, eventIds: formData.eventIds.filter(id => id !== event.id) })
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{event.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Активен
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSlot ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingSlot(null)
                    setFormData({
                      city: 'Москва',
                      eventIds: [],
                      startDate: '',
                      endDate: '',
                      rotationFrequency: 1,
                      isActive: true
                    })
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hero Slots List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Рекламные слоты HERO_BELOW</h2>
          </div>
          
          {heroSlots.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Нет рекламных слотов
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Город
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Мероприятия
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Период
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Частотность
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статистика
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {heroSlots.map((slot) => {
                    const eventIds = JSON.parse(slot.eventIds)
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
                          <button
                            onClick={() => toggleActive(slot.id, slot.isActive)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              slot.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {slot.isActive ? 'Активен' : 'Неактивен'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(slot)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Удалить
                            </button>
                          </div>
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
