'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, MapPin, RotateCcw } from 'lucide-react'

interface HeroSlot {
  id: string
  city: string
  eventIds: string
  startDate: string
  endDate: string
  rotationFrequency: number
  isActive: boolean
  viewCount: number
  clickCount: number
}

interface EditHeroSlotModalProps {
  isOpen: boolean
  onClose: () => void
  slot: HeroSlot | null
  events: any[]
  onSave: (updatedSlot: HeroSlot) => void
}

export default function EditHeroSlotModal({ isOpen, onClose, slot, events, onSave }: EditHeroSlotModalProps) {
  const [formData, setFormData] = useState({
    city: '',
    eventIds: [] as string[],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    rotationFrequency: 5,
    isActive: true
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (slot) {
      const eventIds = JSON.parse(slot.eventIds || '[]')
      const startDate = new Date(slot.startDate)
      const endDate = new Date(slot.endDate)
      
      setFormData({
        city: slot.city,
        eventIds: eventIds,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
        rotationFrequency: slot.rotationFrequency,
        isActive: slot.isActive
      })
    }
  }, [slot])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slot) return

    setLoading(true)
    try {
      // Объединяем дату и время
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`)

      const updatedSlot = {
        ...slot,
        city: formData.city,
        eventIds: JSON.stringify(formData.eventIds),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        rotationFrequency: formData.rotationFrequency,
        isActive: formData.isActive
      }

      const response = await fetch(`/api/admin/hero-slots/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSlot)
      })

      if (response.ok) {
        onSave(updatedSlot)
        onClose()
      }
    } catch (error) {
      console.error('Error updating slot:', error)
    } finally {
      setLoading(false)
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

  if (!isOpen || !slot) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ position: 'relative', zIndex: 100000 }}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Редактировать рекламный слот</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Город */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Город
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Мероприятия */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Мероприятия для рекламы
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {events.map(event => (
                <label key={event.id} className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    checked={formData.eventIds.includes(event.id)}
                    onChange={() => handleEventToggle(event.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{event.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Период показа */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Дата начала
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Время начала
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Время окончания
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Частота ротации */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Частота ротации (секунды)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.rotationFrequency}
              onChange={(e) => setFormData(prev => ({ ...prev, rotationFrequency: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Статус */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Активный слот
            </label>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
