'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Save, Plus, Trash2, X, Search, MapPin, Calendar } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import { Venue } from '@/types/collections'

export default function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [collection, setCollection] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvents, setSelectedEvents] = useState<any[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Состояние для мест
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenues, setSelectedVenues] = useState<Venue[]>([])
  const [showVenueModal, setShowVenueModal] = useState(false)
  const [venueSearchQuery, setVenueSearchQuery] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    city: 'Москва',
    order: 0,
    isActive: true,
    hideFromAfisha: false,
    showInVenues: false,
    showInMain: false,
    showInBlog: false,
    eventsTitle: '',
    eventsDescription: '',
    venuesTitle: '',
    venuesDescription: ''
  })

  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Starting data load...')
      try {
        console.log('📝 Resolving params...')
        // Получаем ID из params
        const resolvedParams = await params
        console.log('✅ Params resolved:', resolvedParams)
        setId(resolvedParams.id)
        
        console.log('📡 Loading collection...')
        // Загружаем коллекцию
        const collectionResponse = await fetch(`/api/admin/collections/${resolvedParams.id}?key=kidsreview2025`)
        console.log('📡 Collection response status:', collectionResponse.status)
        
        if (!collectionResponse.ok) {
          const errorText = await collectionResponse.text()
          console.error('❌ Collection API error:', errorText)
          throw new Error(`Failed to load collection: ${collectionResponse.status} - ${errorText}`)
        }
        
        const collectionData = await collectionResponse.json()
        console.log('✅ Collection data loaded:', collectionData)
        setCollection(collectionData)
        setFormData({
          title: collectionData.title,
          slug: collectionData.slug,
          description: collectionData.description || '',
          coverImage: collectionData.coverImage || '',
          city: collectionData.city,
          order: collectionData.order,
          isActive: collectionData.isActive,
          hideFromAfisha: collectionData.hideFromAfisha || false,
          showInVenues: collectionData.showInVenues || false,
          showInMain: collectionData.showInMain || false,
          showInBlog: collectionData.showInBlog || false,
          eventsTitle: collectionData.eventsTitle || '',
          eventsDescription: collectionData.eventsDescription || '',
          venuesTitle: collectionData.venuesTitle || '',
          venuesDescription: collectionData.venuesDescription || ''
        })

        // Загружаем события коллекции
        if (collectionData.eventCollections) {
          console.log('📅 Setting selected events:', collectionData.eventCollections.map(ec => ec.event))
          setSelectedEvents(collectionData.eventCollections.map(ec => ec.event))
        }

        // Загружаем места коллекции
        if (collectionData.venueCollections) {
          console.log('🏢 Setting selected venues:', collectionData.venueCollections.map(vc => vc.venue))
          setSelectedVenues(collectionData.venueCollections.map(vc => vc.venue))
        }
        
        console.log('📡 Loading all events...')
        // Загружаем все события
        const eventsResponse = await fetch(`/api/admin/afisha/events?key=kidsreview2025`)
        console.log('📡 Events response status:', eventsResponse.status)
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          console.log('✅ Events data loaded:', eventsData.length, 'events')
          setEvents(eventsData)
        } else {
          const errorText = await eventsResponse.text()
          console.error('❌ Events API error:', errorText)
        }

        console.log('📡 Loading all venues...')
        // Загружаем все места
        const venuesResponse = await fetch(`/api/search?type=venue&limit=1000`)
        console.log('📡 Venues response status:', venuesResponse.status)
        
        if (venuesResponse.ok) {
          const venuesData = await venuesResponse.json()
          console.log('✅ Venues data loaded:', venuesData.results?.length || 0, 'venues')
          setVenues(venuesData.results || [])
        } else {
          const errorText = await venuesResponse.text()
          console.error('❌ Venues API error:', errorText)
        }
        
        console.log('🎉 Data loading completed successfully!')
        
      } catch (err) {
        console.error('💥 Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        console.log('🏁 Setting loading to false')
        setLoading(false)
      }
    }
    
    loadData()
  }, [params])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleAddEvent = (event: any) => {
    if (!selectedEvents.find(e => e.id === event.id)) {
      setSelectedEvents(prev => [...prev, event])
    }
  }

  const handleRemoveEvent = (eventId: string) => {
    setSelectedEvents(prev => prev.filter(e => e.id !== eventId))
  }

  // Функции для управления местами
  const handleAddVenue = (venue: Venue) => {
    if (!selectedVenues.find(v => v.id === venue.id)) {
      setSelectedVenues(prev => [...prev, venue])
    }
  }

  const handleRemoveVenue = (venueId: number) => {
    setSelectedVenues(prev => prev.filter(v => v.id !== venueId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    console.log('🚀 Starting form submission...')
    setSaving(true)
    setError(null)

    try {
      console.log('📝 Updating collection data...', formData)
      // Обновляем основную информацию о коллекции
      const response = await fetch(`/api/admin/collections/${id}?key=kidsreview2025`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          citySlug: formData.city === 'Москва' ? 'moscow' : 'saint-petersburg'
        })
      })

      console.log('📡 Collection update response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Collection update error:', errorData)
        throw new Error(errorData.error || 'Failed to update collection')
      }

      // Обновляем события коллекции
      const eventIds = selectedEvents.map(event => event.id)
      console.log('📅 Updating collection events...', eventIds)
      const eventsResponse = await fetch(`/api/admin/collections/${id}/events?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventIds })
      })

      console.log('📡 Events update response status:', eventsResponse.status)
      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json()
        console.error('❌ Events update error:', errorData)
        throw new Error(errorData.error || 'Failed to update collection events')
      }

      // Обновляем места коллекции
      const venueIds = selectedVenues.map(venue => venue.id)
      console.log('🏢 Updating collection venues...', venueIds)
      
      // Сначала удаляем все существующие места
      const currentVenues = collection.venueCollections || []
      console.log('🗑️ Removing existing venues:', currentVenues.length)
      
      for (const venueCollection of currentVenues) {
        const deleteResponse = await fetch(`/api/admin/collections/${id}/venues?key=kidsreview2025`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ venueId: venueCollection.venueId })
        })
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json()
          console.error('❌ Venue delete error:', errorData)
          // Не бросаем ошибку, продолжаем
        }
      }

      // Небольшая задержка для синхронизации базы данных
      await new Promise(resolve => setTimeout(resolve, 100))

      // Затем добавляем новые места
      console.log('➕ Adding new venues:', selectedVenues.length)
      
      for (let i = 0; i < selectedVenues.length; i++) {
        const venue = selectedVenues[i]
        console.log(`Adding venue ${i + 1}/${selectedVenues.length}: ${venue.name}`)
        
        const venueResponse = await fetch(`/api/admin/collections/${id}/venues?key=kidsreview2025`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            venueId: venue.id,
            order: i
          })
        })

        if (!venueResponse.ok) {
          const errorData = await venueResponse.json()
          console.error('❌ Venue add error:', errorData)
          
          // Если место уже есть, это не критическая ошибка
          if (errorData.error === 'Venue already in collection') {
            console.log('⚠️ Venue already exists, skipping:', venue.name)
            continue
          }
          
          throw new Error(errorData.error || 'Failed to add venue to collection')
        }
      }

      console.log('✅ Form submission completed successfully!')
      // Показываем сообщение об успехе и делаем редирект
      alert('Подборка успешно сохранена!')
      window.location.href = '/admin/collections?key=kidsreview2025'
    } catch (err) {
      console.error('💥 Form submission error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      console.log('🏁 Setting saving to false')
      setSaving(false)
    }
  }

  if (loading) {
    console.log('🔄 Rendering loading state...')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка подборки...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {id || 'не определен'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('❌ Rendering error state:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Ошибка загрузки</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-400 mb-4">ID: {id || 'не определен'}</p>
          <Link
            href="/admin/collections?key=kidsreview2025"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Link>
        </div>
      </div>
    )
  }

  if (!collection) {
    console.log('❓ Rendering "collection not found" state. Collection:', collection)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Подборка не найдена</div>
          <p className="text-sm text-gray-400 mb-4">ID: {id || 'не определен'}</p>
          <Link
            href="/admin/collections?key=kidsreview2025"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Link>
        </div>
      </div>
    )
  }

  console.log('✅ Rendering main form. Collection:', collection?.title, 'Events:', selectedEvents.length)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <header className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-unbounded">Редактировать подборку</h1>
            <p className="text-sm text-muted-foreground">Управление подборкой мероприятий</p>
          </div>
          <nav className="flex gap-3 items-center">
            <Link
              href="/admin/collections?key=kidsreview2025"
              className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к списку
            </Link>
          </nav>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Город
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Москва">Москва</option>
                  <option value="Санкт-Петербург">Санкт-Петербург</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL обложки
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Активна
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                События в подборке ({selectedEvents.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить события
                </button>
                {selectedEvents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedEvents([])}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Очистить все
                  </button>
                )}
              </div>
            </div>

            {selectedEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>События не добавлены</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Размещение */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Размещение</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hideFromAfisha"
                  name="hideFromAfisha"
                  checked={formData.hideFromAfisha}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hideFromAfisha" className="ml-2 block text-sm text-gray-700">
                  Скрыть из Афиши
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInVenues"
                  name="showInVenues"
                  checked={formData.showInVenues}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showInVenues" className="ml-2 block text-sm text-gray-700">
                  Показывать в разделе Места
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInMain"
                  name="showInMain"
                  checked={formData.showInMain}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showInMain" className="ml-2 block text-sm text-gray-700">
                  Показывать на Главной
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInBlog"
                  name="showInBlog"
                  checked={formData.showInBlog}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showInBlog" className="ml-2 block text-sm text-gray-700">
                  Показывать в Блоге
                </label>
              </div>
            </div>
          </div>

          {/* Секция События */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Секция "События" ({selectedEvents.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить события
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="eventsTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок секции событий
                </label>
                <input
                  type="text"
                  id="eventsTitle"
                  name="eventsTitle"
                  value={formData.eventsTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="События в подборке"
                />
              </div>

              <div>
                <label htmlFor="eventsDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Описание секции событий
                </label>
                <RichTextEditor
                  content={formData.eventsDescription}
                  onChange={(content) => setFormData(prev => ({ ...prev, eventsDescription: content }))}
                  placeholder="Добавьте описание для секции событий..."
                />
              </div>

              {/* Отображение выбранных событий */}
              {selectedEvents.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Выбранные события:</h3>
                  <div className="space-y-2">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">
                              {event.startDate && new Date(event.startDate).toLocaleDateString('ru-RU')}
                              {event.afishaCategory?.name && ` • ${event.afishaCategory.name}`}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvent(event.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Секция Места */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Секция "Места" ({selectedVenues.length})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(true)}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить места
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="venuesTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок секции мест
                </label>
                <input
                  type="text"
                  id="venuesTitle"
                  name="venuesTitle"
                  value={formData.venuesTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Места в подборке"
                />
              </div>

              <div>
                <label htmlFor="venuesDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Описание секции мест
                </label>
                <RichTextEditor
                  content={formData.venuesDescription}
                  onChange={(content) => setFormData(prev => ({ ...prev, venuesDescription: content }))}
                  placeholder="Добавьте описание для секции мест..."
                />
              </div>

              {/* Список выбранных мест */}
              {selectedVenues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Выбранные места:</h4>
                  {selectedVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{venue.name}</div>
                          <div className="text-sm text-gray-500">{venue.address}</div>
                          <div className="text-sm text-gray-500">{venue.subcategory?.name}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVenue(venue.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/collections?key=kidsreview2025"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </>
              )}
            </button>
          </div>
        </form>

        {/* Модальное окно для выбора событий */}
        {showEventModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Выберите события для подборки</h3>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Поиск событий..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-4">
                  {events
                    .filter(event =>
                      event.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(event => {
                      const isSelected = selectedEvents.some(se => se.id === event.id)
                      return (
                        <div
                          key={event.id}
                          className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => isSelected ? handleRemoveEvent(event.id) : handleAddEvent(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium text-gray-900">{event.title}</div>
                                <div className="text-sm text-gray-500">
                                  {event.startDate && new Date(event.startDate).toLocaleDateString('ru-RU')}
                                  {event.afishaCategory?.name && ` • ${event.afishaCategory.name}`}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="text-blue-600">
                                <X className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  
                  {events.filter(event =>
                    event.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>События не найдены</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Выбрано: {selectedEvents.length} событий
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно для выбора мест */}
        {showVenueModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Выберите места для подборки</h3>
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Поиск мест..."
                  value={venueSearchQuery}
                  onChange={(e) => setVenueSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-4">
                  {venues.filter(venue =>
                    venue.name.toLowerCase().includes(venueSearchQuery.toLowerCase()) ||
                    venue.address?.toLowerCase().includes(venueSearchQuery.toLowerCase())
                  ).map((venue) => {
                    const isSelected = selectedVenues.find(v => v.id === venue.id)
                    return (
                      <div
                        key={venue.id}
                        className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-green-50 border-green-200' 
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => isSelected ? handleRemoveVenue(venue.id) : handleAddVenue(venue)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">{venue.name}</div>
                              <div className="text-sm text-gray-500">{venue.address}</div>
                              <div className="text-sm text-gray-500">{venue.subcategory?.name}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="text-green-600">
                              <X className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {venues.filter(venue =>
                    venue.name.toLowerCase().includes(venueSearchQuery.toLowerCase()) ||
                    venue.address?.toLowerCase().includes(venueSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Места не найдены</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Выбрано: {selectedVenues.length} мест
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVenueModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const availableVenues = venues.filter(v => !selectedVenues.find(sv => sv.id === v.id))
                      if (availableVenues.length > 0) {
                        setSelectedVenues(prev => [...prev, ...availableVenues])
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Добавить все
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVenueModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}