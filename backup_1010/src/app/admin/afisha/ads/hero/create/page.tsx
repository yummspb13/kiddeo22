'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Calendar, MapPin, Star, Target, Users } from 'lucide-react'
import Link from 'next/link'

interface AfishaEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  coverImage?: string
  venue?: string
}

export default function CreateHeroSlotPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const k = searchParams.get('key') ? `?key=${searchParams.get('key')}` : ''

  const [events, setEvents] = useState<AfishaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  console.log('CreateHeroSlotPage rendered')

  // Форма
  const [formData, setFormData] = useState({
    city: 'Москва',
    eventIds: [] as string[],
    startDate: '',
    endDate: '',
    rotationFrequency: 1,
    isActive: true
  })

  // Загрузка мероприятий
  useEffect(() => {
    const loadEvents = async () => {
      console.log('Loading events...')
      try {
        const url = `/api/admin/afisha/events?key=kidsreview2025`
        console.log('Fetching from:', url)
        const response = await fetch(url)
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Events loaded:', data.length, 'events')
          console.log('Events data:', data)
          setEvents(data)
          console.log('Events state set')
        } else {
          console.error('Failed to load events:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        console.log('Setting loading to false')
        setLoading(false)
      }
    }

    loadEvents()
  }, []) // Пустой массив зависимостей - загружаем только один раз

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/hero-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push(`/admin/afisha/ads?tab=hero${k}`)
      } else {
        const error = await response.json()
        alert(`Ошибка: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating hero slot:', error)
      alert('Ошибка при создании рекламного слота')
    } finally {
      setSaving(false)
    }
  }

  const handleEventToggle = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      eventIds: prev.eventIds.includes(eventId)
        ? prev.eventIds.filter(id => id !== eventId)
        : [...prev.eventIds, eventId]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка мероприятий...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/admin/afisha/ads?tab=hero${k}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к Херо-блоку
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Создать рекламный слот</h1>
              <p className="text-sm text-gray-600">Настройте рекламный слот для Херо-блока</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основные настройки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Частотность показа (1-10)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.rotationFrequency}
                    onChange={(e) => setFormData({ ...formData, rotationFrequency: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                    {formData.rotationFrequency}/10
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Чем выше значение, тем чаще будет показываться слот
                </p>
              </div>
            </div>

            {/* Период показа */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
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

            {/* Выбор мероприятий */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Мероприятия для рекламы
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {console.log('Events in form:', events.length, events)}
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Нет доступных мероприятий</p>
                ) : (
                  <div className="space-y-2">
                    {events.map((event) => (
                      <label key={event.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.eventIds.includes(event.id)}
                          onChange={() => handleEventToggle(event.id)}
                          className="mt-1 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.startDate).toLocaleDateString('ru-RU')} - {new Date(event.endDate).toLocaleDateString('ru-RU')}
                          </div>
                          {event.venue && (
                            <div className="text-sm text-gray-500">{event.venue}</div>
                          )}
                        </div>
                        {event.coverImage && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img 
                              src={event.coverImage} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Выбрано мероприятий: {formData.eventIds.length}
              </p>
            </div>

            {/* Статус */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Слот активен (будет показываться пользователям)
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving || formData.eventIds.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Создание...' : 'Создать слот'}
              </button>
              
              <Link
                href={`/admin/afisha/ads?tab=hero${k}`}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
