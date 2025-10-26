'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, MapPin, Star } from 'lucide-react'

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

interface HeroSlotsTableProps {
  adminKey: string
}

export default function HeroSlotsTable({ adminKey }: HeroSlotsTableProps) {
  console.log('HeroSlotsTable: Component rendered with adminKey:', adminKey)
  
  const [heroSlots, setHeroSlots] = useState<HeroSlot[]>([])
  const [events, setEvents] = useState<AfishaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  console.log('HeroSlotsTable: Component rendered with adminKey:', adminKey, 'loading:', loading)
  const [editingSlot, setEditingSlot] = useState<HeroSlot | null>(null)
  const [formData, setFormData] = useState({
    city: 'Москва',
    eventIds: [] as string[],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    rotationFrequency: 1,
    isActive: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('HeroSlotsTable: Starting loadData with adminKey:', adminKey)
        
        if (!adminKey) {
          console.error('HeroSlotsTable: adminKey is empty!')
          setLoading(false)
          return
        }
        
        // Загружаем hero slots
        const heroUrl = `/api/admin/hero-slots?${adminKey}`
        console.log('HeroSlotsTable: Fetching hero slots from:', heroUrl)
        const heroResponse = await fetch(heroUrl)
        console.log('HeroSlotsTable: Hero response status:', heroResponse.status)
        
        if (heroResponse.ok) {
          const heroData = await heroResponse.json()
          console.log('HeroSlotsTable: Hero slots loaded:', heroData.length, heroData)
          setHeroSlots(heroData)
        } else {
          console.error('HeroSlotsTable: Failed to load hero slots:', heroResponse.status)
          const errorText = await heroResponse.text()
          console.error('HeroSlotsTable: Error response:', errorText)
        }

        // Загружаем events из публичного API
        const eventsUrl = `/api/afisha/events`
        console.log('HeroSlotsTable: Fetching events from:', eventsUrl)
        const eventsResponse = await fetch(eventsUrl)
        console.log('HeroSlotsTable: Events response status:', eventsResponse.status)
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          console.log('HeroSlotsTable: Events loaded:', eventsData?.items?.length || 0, eventsData)
          setEvents(eventsData?.items || [])
        } else {
          console.error('HeroSlotsTable: Failed to load events:', eventsResponse.status)
          const errorText = await eventsResponse.text()
          console.error('HeroSlotsTable: Error response:', errorText)
        }
      } catch (error) {
        console.error('HeroSlotsTable: Error loading data:', error)
      } finally {
        console.log('HeroSlotsTable: Setting loading to false')
        setLoading(false)
      }
    }

    loadData()
  }, [adminKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSlot 
        ? `/api/admin/hero-slots/${editingSlot.id}?key=${adminKey}`
        : `/api/admin/hero-slots?key=${adminKey}`
      
      const method = editingSlot ? 'PUT' : 'POST'
      
      // Объединяем дату и время
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`)
      
      const dataToSend = {
        ...formData,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString()
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (response.ok) {
        // Перезагружаем данные
        const heroResponse = await fetch(`/api/admin/hero-slots?key=${adminKey}`)
        if (heroResponse.ok) {
          const heroData = await heroResponse.json()
          setHeroSlots(heroData)
        }
        
        setShowCreateForm(false)
        setEditingSlot(null)
        setFormData({
          city: 'Москва',
          eventIds: [],
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          rotationFrequency: 1,
          isActive: true
        })
      }
    } catch (error) {
      console.error('Error saving hero slot:', error)
    }
  }

  const handleEdit = (slot: HeroSlot) => {
    setEditingSlot(slot)
    // Парсим eventIds, учитывая возможные экранированные кавычки
    let eventIds: string[] = []
    try {
      let cleanedEventIds = slot.eventIds
      
      // Если строка начинается и заканчивается на кавычки, убираем их
      if (cleanedEventIds.startsWith('"') && cleanedEventIds.endsWith('"')) {
        cleanedEventIds = cleanedEventIds.slice(1, -1)
      }
      
      // Убираем лишние экранирования
      cleanedEventIds = cleanedEventIds.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      
      eventIds = JSON.parse(cleanedEventIds)
    } catch (error) {
      console.error('Error parsing eventIds:', error)
      console.error('Original eventIds:', slot.eventIds)
      eventIds = []
    }
    
    // Парсим дату и время
    const startDateTime = new Date(slot.startDate)
    const endDateTime = new Date(slot.endDate)
    
    setFormData({
      city: slot.city,
      eventIds: eventIds,
      startDate: startDateTime.toISOString().split('T')[0],
      startTime: startDateTime.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
      endDate: endDateTime.toISOString().split('T')[0],
      endTime: endDateTime.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
      rotationFrequency: slot.rotationFrequency,
      isActive: slot.isActive
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот слот?')) {
      try {
        const response = await fetch(`/api/admin/hero-slots/${id}?key=${adminKey}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setHeroSlots(heroSlots.filter(slot => slot.id !== id))
        }
      } catch (error) {
        console.error('Error deleting hero slot:', error)
      }
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/hero-slots/${id}?key=${adminKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (response.ok) {
        setHeroSlots(heroSlots.map(slot => 
          slot.id === id ? { ...slot, isActive: !currentStatus } : slot
        ))
      }
    } catch (error) {
      console.error('Error toggling hero slot status:', error)
    }
  }

  if (loading) {
    console.log('HeroSlotsTable: Still loading...')
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    )
  }

  console.log('HeroSlotsTable: Rendering with data:', { heroSlots: heroSlots.length, events: events.length })

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавления */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Hero Slots</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить слот
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingSlot ? 'Редактировать слот' : 'Создать новый слот'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Город</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Москва">Москва</option>
                  <option value="Санкт-Петербург">Санкт-Петербург</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Частота ротации (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.rotationFrequency}
                  onChange={(e) => setFormData({ ...formData, rotationFrequency: parseInt(e.target.value) })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Дата начала</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Время начала</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Дата окончания</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Время окончания</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">События</label>
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {events.map(event => (
                  <label key={event.id} className="flex items-center space-x-2">
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{event.title}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Активен
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingSlot(null)
                  setFormData({
                    city: 'Москва',
                    eventIds: [],
                    startDate: '',
                    startTime: '',
                    endDate: '',
                    endTime: '',
                    rotationFrequency: 1,
                    isActive: true
                  })
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {editingSlot ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица слотов */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
                  Ротация
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
                // Парсим eventIds, учитывая возможные экранированные кавычки
                let eventIds: string[] = []
                try {
                  let cleanedEventIds = slot.eventIds
                  
                  // Если строка начинается и заканчивается на кавычки, убираем их
                  if (cleanedEventIds.startsWith('"') && cleanedEventIds.endsWith('"')) {
                    cleanedEventIds = cleanedEventIds.slice(1, -1)
                  }
                  
                  // Убираем лишние экранирования
                  cleanedEventIds = cleanedEventIds.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
                  
                  eventIds = JSON.parse(cleanedEventIds)
                } catch (error) {
                  console.error('Error parsing eventIds:', error)
                  console.error('Original eventIds:', slot.eventIds)
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
                        <div>
                          <div className="font-medium">С {new Date(slot.startDate).toLocaleDateString('ru-RU')}</div>
                          <div className="text-xs text-gray-400">{new Date(slot.startDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="mt-1">
                          <div className="font-medium">По {new Date(slot.endDate).toLocaleDateString('ru-RU')}</div>
                          <div className="text-xs text-gray-400">{new Date(slot.endDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
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
      </div>
    </div>
  )
}