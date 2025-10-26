// src/app/admin/afisha/events/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Clock, MapPin, Users, DollarSign, X, Save } from 'lucide-react'
import Link from 'next/link'
import { useAdminKey } from '@/hooks/useAdminKey'
import AdminFileUploader from '@/components/AdminFileUploader'
import AdminMultiUploader from '@/components/AdminMultiUploader'

interface Ticket {
  name: string
  description: string
  price: number
  quantity: number
  isActive: boolean
}

interface EventView {
  id: string
  ipAddress: string
  createdAt: string
}

interface AfishaEvent {
  id: number
  title: string
  slug: string
  description?: string
  venue: string
  organizer?: string
  startDate: string
  endDate: string
  coordinates?: string
  order: number
  status: string
  coverImage?: string
  gallery?: string
  tickets?: string
  city: string
  category?: string
  createdAt: string
  updatedAt: string
  ageFrom?: number | null
  ageGroups?: string | null
  // Новые поля для настроек события
  isPopular?: boolean
  isPaid?: boolean
  isPromoted?: boolean
  priority?: number
  // Поля для просмотров
  viewCount?: number
  eventViews?: EventView[]
}

export default function AfishaEventsPage() {
  const { keySuffix } = useAdminKey()
  const [editingEvent, setEditingEvent] = useState<AfishaEvent | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [afishaCategories, setAfishaCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [events, setEvents] = useState<AfishaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editAgeGroups, setEditAgeGroups] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [quickFilters, setQuickFilters] = useState<{ id: number; label: string }[]>([])
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<number[]>([])

  // Загружаем события при монтировании компонента
  useEffect(() => {
    console.log('Component mounted, fetching events...')
    const loadEvents = async () => {
      try {
        console.log('Loading events on mount...')
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/admin/afisha/events?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        console.log('Mount fetch response status:', response.status)
        if (!response.ok) {
          throw new Error('Ошибка загрузки событий')
        }
        const data = await response.json()
        console.log('Mount fetched events:', data)
        setEvents(data)
        console.log('Mount events state updated')
      } catch (err) {
        console.error('Mount fetch events error:', err)
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  // Загружаем категории афиши
  useEffect(() => {
    const loadAfishaCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await fetch(`/api/admin/afisha/categories?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}`)
        const data = await response.json()
        if (response.ok) {
          setAfishaCategories(data.categories || [])
        } else {
          console.error('Error loading afisha categories:', data.error)
        }
      } catch (error) {
        console.error('Error loading afisha categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadAfishaCategories()
  }, [])

  // Загружаем быстрые фильтры
  useEffect(() => {
    const loadQuickFilters = async () => {
      try {
        const response = await fetch(`/api/admin/quick-filters?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}`)
        const data = await response.json()
        console.log('Quick filters response:', data)
        if (response.ok) {
          setQuickFilters(data.quickFilters || [])
          console.log('Quick filters loaded:', data.quickFilters)
        } else {
          console.error('Error loading quick filters:', data.error)
        }
      } catch (error) {
        console.error('Error loading quick filters:', error)
      }
    }

    loadQuickFilters()
  }, [])

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...')
      setLoading(true)
      setError(null) // Сбрасываем ошибку при новой загрузке
      const response = await fetch(`/api/admin/afisha/events?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      console.log('Fetch response status:', response.status)
      if (!response.ok) {
        throw new Error('Ошибка загрузки событий')
      }
      const data = await response.json()
      console.log('Fetched events:', data)
      setEvents(data)
      console.log('Events state updated')
    } catch (err) {
      console.error('Fetch events error:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (event: AfishaEvent) => {
    setEditingEvent({ ...event })
    
    // Инициализация быстрых фильтров
    try {
      const quickFilterIds = event.quickFilterIds ? JSON.parse(event.quickFilterIds) : []
      setSelectedQuickFilters(Array.isArray(quickFilterIds) ? quickFilterIds : [])
    } catch (error) {
      console.error('Error parsing quickFilterIds:', error)
      setSelectedQuickFilters([])
    }
    
    // Инициализация возрастных групп: сначала по сохранённым ageGroups, иначе по ageFrom
    const mapFrom = (age?: number | null) => {
      if (age === null || age === undefined) return ['Любой']
      if (age >= 16) return ['16+']
      if (age >= 13) return ['13–16']
      if (age >= 8) return ['8–12']
      if (age >= 4) return ['4–7']
      return ['0–3']
    }
    
    // Маппинг из формата базы данных в формат формы
    const ageGroupsFromDb: Record<string, string> = {
      '0-3': '0–3',
      '4-7': '4–7',
      '8-12': '8–12',
      '13-16': '13–16',
      '16-plus': '16+',
    }
    
    let initial: string[] | null = null
    try {
      if (event.ageGroups) {
        const parsed = typeof event.ageGroups === 'string' ? JSON.parse(event.ageGroups) : (event.ageGroups as any)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Преобразуем из формата базы данных в формат формы
          initial = parsed.map(g => ageGroupsFromDb[g] || g)
        }
      }
    } catch {}
    setEditAgeGroups(initial ?? mapFrom(event.ageFrom ?? null))
    setShowEditModal(true)
  }

  // Функции для работы с билетами
  const addTicket = () => {
    if (editingEvent) {
      const currentTickets = editingEvent.tickets ? JSON.parse(editingEvent.tickets) : []
      const newTickets = [...currentTickets, {
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        isActive: true
      }]
      setEditingEvent({...editingEvent, tickets: JSON.stringify(newTickets)})
    }
  }

  const updateTicket = (index: number, field: keyof Ticket, value: unknown) => {
    if (editingEvent) {
      const currentTickets = editingEvent.tickets ? JSON.parse(editingEvent.tickets) : []
      const newTickets = currentTickets.map((ticket: Ticket, i: number) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
      setEditingEvent({...editingEvent, tickets: JSON.stringify(newTickets)})
    }
  }

  const removeTicket = (index: number) => {
    if (editingEvent) {
      const currentTickets = editingEvent.tickets ? JSON.parse(editingEvent.tickets) : []
      const newTickets = currentTickets.filter((_: Ticket, i: number) => i !== index)
      setEditingEvent({...editingEvent, tickets: JSON.stringify(newTickets)})
    }
  }

  const handleSaveEvent = async () => {
    if (editingEvent) {
      try {
        const AGE_GROUPS_TO_MIN: Record<string, number | null> = {
          'Любой': null,
          '0–3': 0,
          '4–7': 4,
          '8–12': 8,
          '13–16': 13,
          '16+': 16,
        }
        
        // Преобразуем значения ageGroups в формат для фильтров
        const ageGroupsMapping: Record<string, string> = {
          'Любой': 'any',
          '0–3': '0-3',
          '4–7': '4-7',
          '8–12': '8-12',
          '13–16': '13-16',
          '16+': '16-plus',
        }
        
        const selectedBounds = editAgeGroups
          .map(g => AGE_GROUPS_TO_MIN[g])
          .filter(v => v !== null && typeof v === 'number') as number[]
        const derivedAgeFrom = editAgeGroups.includes('Любой') ? null : (selectedBounds.length ? Math.min(...selectedBounds) : null)
        
        // Преобразуем ageGroups в формат для фильтров
        const mappedAgeGroups = editAgeGroups
          .map(g => ageGroupsMapping[g])
          .filter(Boolean)

        // Подготавливаем данные для отправки
        const eventData = {
          title: editingEvent.title,
          slug: editingEvent.slug,
          description: editingEvent.description || null,
          venue: editingEvent.venue,
          organizer: editingEvent.organizer || null,
          startDate: editingEvent.startDate,
          endDate: editingEvent.endDate,
          coordinates: editingEvent.coordinates || null,
          order: editingEvent.order,
          status: editingEvent.status,
          coverImage: editingEvent.coverImage || null,
          gallery: editingEvent.gallery || null,
          tickets: editingEvent.tickets || null,
          city: editingEvent.city,
          category: editingEvent.category || null,
          ageFrom: derivedAgeFrom,
          // Новые поля для настроек события
          isPopular: editingEvent.isPopular || false,
          isPaid: editingEvent.isPaid || false,
          isPromoted: editingEvent.isPromoted || false,
          priority: editingEvent.priority || 5,
          quickFilterIds: selectedQuickFilters.length > 0 ? JSON.stringify(selectedQuickFilters) : null,
        }

        const response = await fetch(`/api/admin/afisha/events/${editingEvent.id}?key=kidsreview2025`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...eventData, ageGroups: mappedAgeGroups }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Ошибка сохранения события')
        }
        
        // Обновляем локальное состояние
        setEvents(events.map(event => 
          event.id === editingEvent.id ? editingEvent : event
        ))
        setShowEditModal(false)
        setEditingEvent(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка сохранения')
      }
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditingEvent(null)
  }

  // Функция для быстрого изменения приоритета
  const handleQuickPriorityChange = async (eventId: string, newPriority: number) => {
    try {
      // Находим событие в локальном состоянии
      const event = events.find(e => e.id === eventId)
      if (!event) {
        throw new Error('Событие не найдено')
      }

      // Подготавливаем полные данные события с новым приоритетом
      const eventData = {
        title: event.title,
        slug: event.slug,
        description: event.description,
        venue: event.venue,
        organizer: event.organizer,
        startDate: event.startDate,
        endDate: event.endDate,
        coordinates: event.coordinates,
        order: event.order,
        status: event.status,
        coverImage: event.coverImage,
        gallery: event.gallery,
        tickets: event.tickets,
        city: event.city,
        category: event.category,
        ageFrom: event.ageFrom,
        ageGroups: event.ageGroups,
        // Обновляем только приоритет
        priority: newPriority,
        isPopular: event.isPopular || false,
        isPaid: event.isPaid || false,
        isPromoted: event.isPromoted || false
      }

      const response = await fetch(`/api/admin/afisha/events/${eventId}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Ошибка изменения приоритета')
      }
      
      // Обновляем локальное состояние
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, priority: newPriority } : event
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка изменения приоритета')
    }
  }

  // Функция для быстрого изменения статуса продвижения
  const handleQuickPromotionToggle = async (eventId: string, isPromoted: boolean) => {
    try {
      // Находим событие в локальном состоянии
      const event = events.find(e => e.id === eventId)
      if (!event) {
        throw new Error('Событие не найдено')
      }

      // Подготавливаем полные данные события с новым статусом продвижения
      const eventData = {
        title: event.title,
        slug: event.slug,
        description: event.description,
        venue: event.venue,
        organizer: event.organizer,
        startDate: event.startDate,
        endDate: event.endDate,
        coordinates: event.coordinates,
        order: event.order,
        status: event.status,
        coverImage: event.coverImage,
        gallery: event.gallery,
        tickets: event.tickets,
        city: event.city,
        category: event.category,
        ageFrom: event.ageFrom,
        ageGroups: event.ageGroups,
        // Обновляем только статус продвижения
        priority: event.priority || 5,
        isPopular: event.isPopular || false,
        isPaid: event.isPaid || false,
        isPromoted: isPromoted
      }

      const response = await fetch(`/api/admin/afisha/events/${eventId}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Ошибка изменения статуса продвижения')
      }
      
      // Обновляем локальное состояние
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, isPromoted } : event
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка изменения статуса продвижения')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Удалить событие?')) {
      try {
        console.log('Deleting event with ID:', id)
        
        // Проверяем, есть ли событие в текущем списке
        const eventExists = events.find(event => event.id === id)
        if (!eventExists) {
          console.log('Event not found in current list, refreshing...')
          await fetchEvents()
          return
        }
        
        const response = await fetch(`/api/admin/afisha/events/${id}?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}`, {
          method: 'DELETE',
        })
        
        console.log('Delete response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Delete error:', errorData)
          throw new Error(`Ошибка удаления события: ${response.status} ${errorData.error || response.statusText}`)
        }
        
        console.log('Event deleted successfully')
        
        // Сбрасываем ошибку при успешном удалении
        setError(null)
        
        // Принудительно обновляем список событий с сервера
        console.log('Refreshing events list...')
        await fetchEvents()
        
        // Дополнительная проверка - принудительно обновляем состояние
        console.log('Force updating events state...')
        const refreshResponse = await fetch(`/api/admin/afisha/events?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          console.log('Refreshed events from server:', refreshData)
          setEvents(refreshData)
          setRefreshKey(prev => prev + 1) // Принудительное обновление
        }
      } catch (err) {
        console.error('Delete error:', err)
        setError(err instanceof Error ? err.message : 'Ошибка удаления')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка событий...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Ошибка: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">События</h1>
          <p className="text-sm text-gray-600">Управление всеми событиями афиши</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            Обновить
          </button>
          <Link
            href={`/admin/afisha/events/create${keySuffix}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Создать событие
          </Link>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск событий..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="pending">На модерации</option>
            <option value="draft">Черновики</option>
            <option value="archived">Архивные</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Все города</option>
            <option value="moscow">Москва</option>
            <option value="spb">СПб</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Все категории</option>
            <option value="theater">Театр</option>
            <option value="music">Музыка</option>
            <option value="sport">Спорт</option>
            <option value="workshop">Мастер-класс</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Всего событий</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Платных событий</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">На модерации</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Всего билетов</p>
              <p className="text-2xl font-bold text-gray-900">15.2K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица событий */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Список событий</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Событие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата/Время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Место
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Билеты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Просмотры
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" key={refreshKey}>
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditEvent(event)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {event.coverImage ? (
                          <img 
                            src={event.coverImage} 
                            alt="Обложка" 
                            className="h-10 w-10 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                              if (nextElement) {
                                nextElement.style.display = 'flex'
                              }
                            }}
                          />
                        ) : null}
                        <div className={`h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center ${event.coverImage ? 'hidden' : ''}`}>
                          <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.category} • {event.city}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {event.priority && event.priority <= 2 && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              Приоритет {event.priority}
                            </span>
                          )}
                          {event.isPromoted && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Продвигается
                            </span>
                          )}
                          {event.isPopular && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Популярное
                            </span>
                          )}
                        </div>
                        {event.gallery && (() => {
                          try {
                            const gallery = JSON.parse(event.gallery)
                            if (Array.isArray(gallery) && gallery.length > 0) {
                              return (
                                <div className="text-xs text-blue-600 mt-1">
                                  📷 {gallery.length} фото
                                </div>
                              )
                            }
                          } catch (e) {
                            // ignore
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(event.startDate).toLocaleDateString('ru-RU')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {event.venue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        try {
                          const tickets = event.tickets ? JSON.parse(event.tickets) : []
                          if (tickets.length === 0) return 'Бесплатно'
                          const minPrice = Math.min(...tickets.map((t: any) => t.price || 0))
                          return minPrice > 0 ? `от ${minPrice} ₽` : 'Бесплатно'
                        } catch {
                          return 'Бесплатно'
                        }
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.tickets ? 'Есть билеты' : 'Без билетов'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        try {
                          const tickets = event.tickets ? JSON.parse(event.tickets) : []
                          const totalQuantity = tickets.reduce((sum: number, t: any) => sum + (t.quantity || 0), 0)
                          return totalQuantity > 0 ? `${totalQuantity} билетов` : 'Без ограничений'
                        } catch {
                          return 'Без ограничений'
                        }
                      })()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-0"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{event.viewCount || 0}</span>
                        <span className="text-gray-500">всего</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span>{event.eventViews?.length || 0} уникальных</span>
                      </div>
                    </div>
                    {event.eventViews && event.eventViews.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Последний: {new Date(event.eventViews[event.eventViews.length - 1].createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status === 'active' ? 'Активно' : 
                       event.status === 'pending' ? 'На модерации' : 'Черновик'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Быстрые кнопки приоритета */}
                      <div className="flex items-center gap-1 mr-2">
                        <button 
                          onClick={() => handleQuickPriorityChange(event.id, 1)}
                          className={`px-2 py-1 text-xs rounded ${
                            event.priority === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                          }`}
                          title="Высокий приоритет"
                        >
                          ⭐
                        </button>
                        <button 
                          onClick={() => handleQuickPriorityChange(event.id, 3)}
                          className={`px-2 py-1 text-xs rounded ${
                            event.priority === 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                          }`}
                          title="Средний приоритет"
                        >
                          ⚡
                        </button>
                        <button 
                          onClick={() => handleQuickPriorityChange(event.id, 5)}
                          className={`px-2 py-1 text-xs rounded ${
                            event.priority === 5 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                          }`}
                          title="Обычный приоритет"
                        >
                          📅
                        </button>
                      </div>
                      
                      {/* Кнопка продвижения */}
                      <button 
                        onClick={() => handleQuickPromotionToggle(event.id, !event.isPromoted)}
                        className={`px-2 py-1 text-xs rounded ${
                          event.isPromoted ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                        }`}
                        title={event.isPromoted ? 'Убрать продвижение' : 'Продвигать'}
                      >
                        📢
                      </button>
                      
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        title="Просмотреть"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно редактирования */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Редактирование события</h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Основная информация */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название события *
                    </label>
                    <input
                      type="text"
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={editingEvent.slug}
                      onChange={(e) => setEditingEvent({...editingEvent, slug: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория
                    </label>
                    <select
                      value={editingEvent.category || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={categoriesLoading}
                    >
                      <option value="">Не выбрано</option>
                      {afishaCategories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Город *
                    </label>
                    <select
                      value={editingEvent.city}
                      onChange={(e) => setEditingEvent({...editingEvent, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Москва">Москва</option>
                      <option value="Санкт-Петербург">Санкт-Петербург</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Место проведения *
                    </label>
                    <input
                      type="text"
                      value={editingEvent.venue}
                      onChange={(e) => setEditingEvent({...editingEvent, venue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Организатор
                    </label>
                    <input
                      type="text"
                      value={editingEvent.organizer || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, organizer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Координаты (lat,lng)
                    </label>
                    <input
                      type="text"
                      value={editingEvent.coordinates || ''}
                      onChange={(e) => setEditingEvent({...editingEvent, coordinates: e.target.value})}
                      placeholder="55.7558, 37.6176"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Порядок
                    </label>
                    <input
                      type="number"
                      value={editingEvent.order}
                      onChange={(e) => setEditingEvent({...editingEvent, order: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Возрастные группы */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Возраст</h4>
                <label className="block text-sm font-medium text-gray-700 mb-2">Для какого возраста</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Любой','0–3','4–7','8–12','13–16','16+'].map(opt => {
                    const checked = editAgeGroups.includes(opt)
                    return (
                      <label key={opt} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${checked ? 'bg-blue-50 border-blue-300' : ''}`}>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={e => {
                            setEditAgeGroups(prev => {
                              const next = new Set(prev)
                              if (e.target.checked) next.add(opt); else next.delete(opt)
                              if (opt === 'Любой' && e.target.checked) return ['Любой']
                              const arr = Array.from(next)
                              return arr.filter(v => v !== 'Любой')
                            })
                          }}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">Можно выбрать несколько диапазонов. ageFrom вычисляется автоматически.</p>
              </div>


              {/* Даты и время */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Даты и время</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата начала *
                    </label>
                    <input
                      type="date"
                      value={editingEvent.startDate ? new Date(editingEvent.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingEvent({...editingEvent, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Время начала
                    </label>
                    <input
                      type="time"
                      value={editingEvent.startDate ? new Date(editingEvent.startDate).toTimeString().slice(0, 5) : ''}
                      onChange={(e) => {
                        const date = new Date(editingEvent.startDate)
                        const [hours, minutes] = e.target.value.split(':')
                        date.setHours(parseInt(hours), parseInt(minutes))
                        setEditingEvent({...editingEvent, startDate: date.toISOString()})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата окончания *
                    </label>
                    <input
                      type="date"
                      value={editingEvent.endDate ? new Date(editingEvent.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingEvent({...editingEvent, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Время окончания
                    </label>
                    <input
                      type="time"
                      value={editingEvent.endDate ? new Date(editingEvent.endDate).toTimeString().slice(0, 5) : ''}
                      onChange={(e) => {
                        const date = new Date(editingEvent.endDate)
                        const [hours, minutes] = e.target.value.split(':')
                        date.setHours(parseInt(hours), parseInt(minutes))
                        setEditingEvent({...editingEvent, endDate: date.toISOString()})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Описание */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Описание</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Обложка */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Обложка</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Обложка
                  </label>
                  <AdminFileUploader
                    value={editingEvent.coverImage || ''}
                    onChange={(url) => setEditingEvent({...editingEvent, coverImage: url})}
                  />
                </div>
              </div>

              {/* Галерея фотографий */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Галерея фотографий</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Галерея (до 20 фото)
                  </label>
                  <AdminMultiUploader
                    value={editingEvent.gallery ? JSON.parse(editingEvent.gallery) : []}
                    onChange={(urls) => setEditingEvent({...editingEvent, gallery: JSON.stringify(urls)})}
                    maxCount={20}
                  />
                </div>
              </div>

              {/* Билеты */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Билеты</h4>
                  <button
                    type="button"
                    onClick={addTicket}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Добавить билет
                  </button>
                </div>
                
                {editingEvent.tickets && (() => {
                  try {
                    const tickets = JSON.parse(editingEvent.tickets)
                    if (Array.isArray(tickets) && tickets.length > 0) {
                      return (
                        <div className="space-y-4">
                          {tickets.map((ticket: Ticket, index: number) => (
                            <div key={index} className="border rounded-lg p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">Билет {index + 1}</h5>
                                <button
                                  type="button"
                                  onClick={() => removeTicket(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Удалить
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название билета *
                                  </label>
                                  <input
                                    type="text"
                                    value={ticket.name}
                                    onChange={(e) => updateTicket(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Цена (₽) *
                                  </label>
                                  <input
                                    type="number"
                                    value={ticket.price}
                                    onChange={(e) => updateTicket(index, 'price', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Количество *
                                  </label>
                                  <input
                                    type="number"
                                    value={ticket.quantity}
                                    onChange={(e) => updateTicket(index, 'quantity', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={ticket.isActive}
                                    onChange={(e) => updateTicket(index, 'isActive', e.target.checked)}
                                    className="rounded"
                                  />
                                  <label className="text-sm text-gray-700">Активно</label>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Короткое описание (до 100 символов)
                                </label>
                                <textarea
                                  value={ticket.description}
                                  onChange={(e) => updateTicket(index, 'description', e.target.value)}
                                  rows={2}
                                  maxLength={100}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {ticket.description.length}/100 символов
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    }
                  } catch (e) {
                    return <div className="text-red-500 text-sm">Неверный JSON формат билетов</div>
                  }
                  return null
                })()}
              </div>

              {/* Настройки события */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Настройки события</h4>
                <p className="text-sm text-gray-600 mb-4">Отметьте особенности события для правильного отображения на сайте.</p>
                
                <div className="space-y-4">
                  {/* Популярное событие */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={editingEvent.isPopular || false}
                      onChange={(e) => setEditingEvent({...editingEvent, isPopular: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPopular" className="ml-3 flex items-center">
                      <span className="text-lg mr-2">⭐</span>
                      <span className="text-sm font-medium text-gray-700">Популярное событие</span>
                      <span className="text-xs text-gray-500 ml-2">Будет показано в блоке популярных событий на главной</span>
                    </label>
                  </div>

                  {/* Платное событие */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPaid"
                      checked={editingEvent.isPaid || false}
                      onChange={(e) => setEditingEvent({...editingEvent, isPaid: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPaid" className="ml-3 flex items-center">
                      <span className="text-lg mr-2">💰</span>
                      <span className="text-sm font-medium text-gray-700">Платное событие</span>
                      <span className="text-xs text-gray-500 ml-2">Событие с платными билетами</span>
                    </label>
                  </div>

                  {/* Реклама в афише */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPromoted"
                      checked={editingEvent.isPromoted || false}
                      onChange={(e) => setEditingEvent({...editingEvent, isPromoted: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPromoted" className="ml-3 flex items-center">
                      <span className="text-lg mr-2">📢</span>
                      <span className="text-sm font-medium text-gray-700">Реклама в афише</span>
                      <span className="text-xs text-gray-500 ml-2">Продвижение события в рекламных блоках</span>
                    </label>
                  </div>

                  {/* Приоритет отображения */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Приоритет отображения
                    </label>
                    <select
                      id="priority"
                      value={editingEvent.priority || 5}
                      onChange={(e) => setEditingEvent({...editingEvent, priority: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 - Высший приоритет</option>
                      <option value={2}>2 - Высокий приоритет</option>
                      <option value={3}>3 - Средний приоритет</option>
                      <option value={4}>4 - Низкий приоритет</option>
                      <option value={5}>5 - Обычный приоритет</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Чем меньше число, тем выше приоритет отображения</p>
                  </div>

                  {/* Быстрые фильтры */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Быстрые фильтры
                    </label>
                    <p className="text-xs text-gray-500 mb-3">Выберите подходящие быстрые фильтры для этого события</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {quickFilters.map((filter) => (
                        <div key={filter.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`quickFilter-${filter.id}`}
                            checked={selectedQuickFilters.includes(filter.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQuickFilters([...selectedQuickFilters, filter.id])
                              } else {
                                setSelectedQuickFilters(selectedQuickFilters.filter(id => id !== filter.id))
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`quickFilter-${filter.id}`} className="ml-2 text-sm text-gray-700">
                            {filter.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {quickFilters.length === 0 && (
                      <p className="text-sm text-gray-500">Нет доступных быстрых фильтров</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Статус */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Статус</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({...editingEvent, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Активно</option>
                    <option value="draft">Черновик</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
