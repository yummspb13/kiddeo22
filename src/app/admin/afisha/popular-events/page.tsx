'use client'

import { useState, useEffect } from 'react'
import { useAdminKey } from '@/hooks/useAdminKey'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Eye, Trash2, Calendar, MapPin } from 'lucide-react'
import AdminFileUploader from '@/components/AdminFileUploader'
import AdminMultiUploader from '@/components/AdminMultiUploader'

interface PopularEvent {
  id: number
  eventId: string
  title: string
  slug: string
  description?: string
  imageUrl?: string
  price?: string
  date?: string
  location?: string
  category?: string
  isActive: boolean
  order: number
  startDate?: string
  endDate?: string
  clickCount: number
  viewCount: number
  // Новые управляемые поля
  tickets?: string | null // JSON
  vendorName?: string | null
  coordinatesLat?: number | null
  coordinatesLng?: number | null
  images?: string | null
  city?: {
    id: number
    name: string
    slug: string
  }
  createdAt: string
  updatedAt: string
}

export default function PopularEventsPage() {
  const { keySuffix } = useAdminKey()

  const [events, setEvents] = useState<PopularEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<PopularEvent | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Загрузка мероприятий
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/popular-events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching popular events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  // Обработчики
  const handleEditEvent = (event: PopularEvent) => {
    setEditingEvent(event)
    setShowEditModal(true)
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowCreateModal(true)
  }

  const handleSaveEvent = async (eventData: any) => {
    if (eventData.isActive) {
      const activeCount = events.filter(e => e.isActive && e.id !== editingEvent?.id).length
      if (activeCount >= 3) {
        alert('Максимум 3 активных карточки в ротации (десктоп). Отключите одну, чтобы активировать новую.')
        return
      }
    }
    // Ограничение: не более 3 активных карточек
    if (eventData.isActive) {
      const activeCount = events.filter(e => e.isActive && e.id !== editingEvent?.id).length
      if (activeCount >= 3) {
        alert('Максимум 3 активных карточки в ротации (десктоп). Отключите одну, чтобы активировать новую.')
        return
      }
    }

    try {
      const url = editingEvent 
        ? `/api/admin/popular-events/${editingEvent.id}`
        : '/api/admin/popular-events'
      
      const method = editingEvent ? 'PUT' : 'POST'
      
      const payload: any = {
        ...eventData,
        // цена вычисляется из билетов — не сохраняем явную price
      }
      if (Array.isArray((eventData as any).tickets)) {
        payload.tickets = (eventData as any).tickets
      }
      if (Array.isArray((eventData as any).images)) {
        payload.images = (eventData as any).images
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchEvents()
        setShowEditModal(false)
        setShowCreateModal(false)
        setEditingEvent(null)
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это мероприятие?')) return

    try {
      const response = await fetch(`/api/admin/popular-events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleToggleActive = async (event: PopularEvent) => {
    if (!event.isActive) {
      const activeCount = events.filter(e => e.isActive).length
      if (activeCount >= 3) {
        alert('Максимум 3 активных карточки в ротации (десктоп). Отключите одну, чтобы активировать новую.')
        return
      }
    }
    if (!event.isActive) {
      const activeCount = events.filter(e => e.isActive).length
      if (activeCount >= 3) {
        alert('Максимум 3 активных карточки в ротации (десктоп). Отключите одну, чтобы активировать новую.')
        return
      }
    }
    try {
      const response = await fetch(`/api/admin/popular-events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          isActive: !event.isActive
        }),
      })

      if (response.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error('Error toggling event status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/afisha${keySuffix}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                В админ-панель
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Популярные мероприятия
              </h1>
            </div>
            <button
              onClick={handleCreateEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Добавить мероприятие
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 text-sm text-gray-600">
          Максимум 3 активных карточки в ротации (десктоп). Сейчас активных: {events.filter(e => e.isActive).length}.
        </div>
        {/* Ограничение по количеству */}
        <div className="mb-4 text-sm text-gray-600">
          Максимум 3 активных карточки в ротации (десктоп). Сейчас активных: {events.filter(e => e.isActive).length}.
        </div>
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            <div className="text-gray-600">Всего мероприятий</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.isActive).length}
            </div>
            <div className="text-gray-600">Активных</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {events.reduce((sum, e) => sum + e.clickCount, 0)}
            </div>
            <div className="text-gray-600">Всего кликов</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {events.reduce((sum, e) => sum + e.viewCount, 0)}
            </div>
            <div className="text-gray-600">Всего просмотров</div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Мероприятие
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
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
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {event.imageUrl && (
                          <img
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                            src={event.imageUrl}
                            alt={event.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.category || 'Не указано'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.date ? new Date(event.date).toLocaleDateString('ru-RU') : 'Не указано'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Клики: {event.clickCount}</div>
                      <div>Просмотры: {event.viewCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(event)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {event.isActive ? 'Активно' : 'Неактивно'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/event/${event.slug}`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Нет популярных мероприятий</div>
            <button
              onClick={handleCreateEvent}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Добавить первое мероприятие
            </button>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {(showEditModal || showCreateModal) && (
        <EventModal
          event={editingEvent}
          allEvents={events}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowEditModal(false)
            setShowCreateModal(false)
            setEditingEvent(null)
          }}
        />
      )}
    </div>
  )
}

// Modal Component
function EventModal({ 
  event, 
  allEvents,
  onSave, 
  onClose 
}: { 
  event: PopularEvent | null
  allEvents: PopularEvent[]
  onSave: (data: Partial<PopularEvent>) => void
  onClose: () => void 
}) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [formData, setFormData] = useState({
    eventId: event?.eventId || '',
    title: event?.title || '',
    slug: event?.slug || '',
    description: event?.description || '',
    imageUrl: event?.imageUrl || '',
    date: '',
    location: event?.location || '',
    category: event?.category || '',
    isActive: event?.isActive ?? true,
    order: event?.order || 0,
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0,16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0,16) : '',
    cityId: (event as any)?.cityId?.toString?.() || '',
    tickets: (() => {
      try {
        const t = (event as any)?.tickets
        if (!t) return [{ name: '', subtitle: '', price: '' }]
        const arr = typeof t === 'string' ? JSON.parse(t) : t
        return Array.isArray(arr) && arr.length > 0 ? arr : [{ name: '', subtitle: '', price: '' }]
      } catch { return [{ name: '', subtitle: '', price: '' }] }
    })(),
    vendorName: (event as any)?.vendorName || '',
    coordinatesLat: (event as any)?.coordinatesLat ?? '',
    coordinatesLng: (event as any)?.coordinatesLng ?? '',
    images: (() => {
      try {
        const imgs = (event as any)?.images
        const arr = typeof imgs === 'string' ? JSON.parse(imgs) : imgs
        return Array.isArray(arr) ? arr : []
      } catch { return [] }
    })()
  })

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/categories')
        if (res.ok) setCategories(await res.json())
      } catch {}
    })()
  }, [])

  useEffect(() => {
    if (!event) {
      if (!formData.eventId) {
        const used = new Set(allEvents.map(e => e.eventId))
        let next = 0
        while (next <= 50000 && used.has(String(next))) next++
        setFormData((f) => ({ ...f, eventId: String(next), slug: String(next) }))
      }
      if (!formData.slug && formData.eventId) {
        setFormData((f) => ({ ...f, slug: f.eventId }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as any)
  }

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {event ? 'Редактировать мероприятие' : 'Создать мероприятие'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID мероприятия *
                </label>
                <input
                  type="text"
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Не выбрано</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Цена убрана: рассчитывается на клиенте из билетов */}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Место проведения
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Организатор (отображаемое имя)
                </label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала (с временем)</label>
                  <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания (с временем)</label>
                  <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Координаты: широта (lat)</label>
                  <input type="number" step="any" value={formData.coordinatesLat} onChange={(e) => setFormData({ ...formData, coordinatesLat: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Координаты: долгота (lng)</label>
                  <input type="number" step="any" value={formData.coordinatesLng} onChange={(e) => setFormData({ ...formData, coordinatesLng: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Обложка (изображение)</label>
              <AdminFileUploader value={formData.imageUrl} onChange={(url: string) => setFormData({ ...formData, imageUrl: url })} />
              <p className="text-xs text-gray-500 mt-1">Рекомендуемое соотношение 16:9, до 5MB.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Галерея (до 20 фото)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <AdminMultiUploader value={formData.images} onChange={(urls) => setFormData({ ...formData, images: urls })} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Билеты</label>
              <div className="space-y-3">
                {formData.tickets.map((t: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" placeholder="Название билета" value={t.name} onChange={(e) => { const next = [...formData.tickets]; next[idx] = { ...next[idx], name: e.target.value }; setFormData({ ...formData, tickets: next }) }} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    <input type="text" placeholder="Короткое описание (до 100 символов)" maxLength={100} value={t.subtitle || ''} onChange={(e) => { const next = [...formData.tickets]; next[idx] = { ...next[idx], subtitle: e.target.value }; setFormData({ ...formData, tickets: next }) }} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    <input type="number" placeholder="Цена" value={t.price} onChange={(e) => { const next = [...formData.tickets]; next[idx] = { ...next[idx], price: e.target.value }; setFormData({ ...formData, tickets: next }) }} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setFormData({ ...formData, tickets: [...formData.tickets, { name: '', subtitle: '', price: '' }] })} className="mt-3 px-3 py-2 border rounded-md hover:bg-gray-50">Добавить билет</button>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Активно
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {event ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
