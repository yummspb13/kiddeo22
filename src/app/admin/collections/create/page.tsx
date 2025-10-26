'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X, Plus, Search, Trash2, Calendar } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import { Venue } from '@/types/collections'

export default function CreateCollectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    city: 'Москва',
    citySlug: 'moscow',
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

  // Состояние для управления местами
  const [selectedVenues, setSelectedVenues] = useState<Venue[]>([])
  const [venueSearch, setVenueSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Venue[]>([])
  const [showVenueSearch, setShowVenueSearch] = useState(false)

  // Состояние для управления событиями
  const [selectedEvents, setSelectedEvents] = useState<any[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventSearch, setEventSearch] = useState('')
  const [events, setEvents] = useState<any[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  // Загрузка всех мест
  const loadVenues = async () => {
    try {
      const response = await fetch(`/api/admin/venues?key=kidsreview2025&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data || [])
      }
    } catch (error) {
      console.error('Error loading venues:', error)
    }
  }

  // Поиск мест (фильтрация на клиенте)
  const searchVenues = (query: string) => {
    if (query.length < 2) {
      // Показываем все места если запрос короткий
      loadVenues()
      return
    }

    // Фильтруем уже загруженные места
    const filtered = searchResults.filter(venue => 
      venue.title.toLowerCase().includes(query.toLowerCase()) ||
      venue.description?.toLowerCase().includes(query.toLowerCase()) ||
      venue.address?.toLowerCase().includes(query.toLowerCase())
    )
    setSearchResults(filtered)
  }

  // Добавить место в подборку
  const addVenue = (venue: Venue) => {
    if (!selectedVenues.find(v => v.id === venue.id)) {
      setSelectedVenues(prev => [...prev, venue])
    }
    setVenueSearch('')
    setSearchResults([])
    setShowVenueSearch(false)
  }

  // Удалить место из подборки
  const removeVenue = (venueId: number) => {
    setSelectedVenues(prev => prev.filter(v => v.id !== venueId))
  }

  // Обработка загрузки файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          coverImage: event.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Функции для управления событиями
  const handleAddEvent = (event: any) => {
    if (!selectedEvents.find(e => e.id === event.id)) {
      setSelectedEvents(prev => [...prev, event])
    }
  }

  const handleRemoveEvent = (eventId: string) => {
    setSelectedEvents(prev => prev.filter(e => e.id !== eventId))
  }

  // Загрузка событий при открытии модального окна
  useEffect(() => {
    if (showEventModal) {
      const loadEvents = async () => {
        try {
          const response = await fetch(`/api/admin/afisha/events?key=kidsreview2025`)
          if (response.ok) {
            const data = await response.json()
            setEvents(data)
          }
        } catch (error) {
          console.error('Error loading events:', error)
        }
      }
      loadEvents()
    }
  }, [showEventModal])

  // Загрузка мест при открытии модального окна
  useEffect(() => {
    if (showVenueSearch) {
      loadVenues()
    }
  }, [showVenueSearch])

  // Обработка поиска мест
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchVenues(venueSearch)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [venueSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Создаем подборку
      const response = await fetch('/api/admin/collections?key=kidsreview2025', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create collection')
      }

      const collection = await response.json()

      // Добавляем события в подборку
      if (selectedEvents.length > 0) {
        const eventIds = selectedEvents.map(event => event.id)
        await fetch(`/api/admin/collections/${collection.id}/events?key=kidsreview2025`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ eventIds })
        })
      }

      // Добавляем места в подборку
      if (selectedVenues.length > 0) {
        for (let i = 0; i < selectedVenues.length; i++) {
          const venue = selectedVenues[i]
          await fetch(`/api/admin/collections/${collection.id}/venues?key=kidsreview2025`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              venueId: venue.id,
              order: i
            })
          })
        }
      }

      router.push('/admin/collections?key=kidsreview2025')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/collections?key=kidsreview2025"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Создать подборку</h1>
              <p className="text-gray-600 mt-2">Заполните информацию о новой подборке событий</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Название подборки *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Например: Елки в Москве: 20 новогодних представлений"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL-адрес (slug) *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="elki-v-moskve-2025"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Будет использоваться в URL: /collections/{formData.slug}
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Краткое описание подборки..."
                />
              </div>

              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Обложка подборки
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="coverImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Загрузить фото</span>
                        <input
                          id="coverImage"
                          name="coverImage"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">или перетащите сюда</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF до 10MB</p>
                  </div>
                </div>
                {formData.coverImage && (
                  <div className="mt-2">
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Настройки</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Город *
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Москва">Москва</option>
                  <option value="Санкт-Петербург">Санкт-Петербург</option>
                  <option value="Екатеринбург">Екатеринбург</option>
                  <option value="Новосибирск">Новосибирск</option>
                </select>
              </div>

              <div>
                <label htmlFor="citySlug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL города
                </label>
                <input
                  type="text"
                  id="citySlug"
                  name="citySlug"
                  value={formData.citySlug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="moscow"
                />
              </div>

              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                  Порядок сортировки
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Активна
                </label>
              </div>
            </div>
          </div>

          {/* Размещение */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Размещение</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <h2 className="text-lg font-medium text-gray-900">Секция "События"</h2>
              <button
                type="button"
                onClick={() => setShowEventModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить событие
              </button>
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
            </div>
          </div>

          {/* Секция Места */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Секция "Места"</h2>
            
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

              {/* Поиск и добавление мест */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Места в подборке
                </label>
                
                {/* Кнопка поиска мест */}
                <button
                  type="button"
                  onClick={() => setShowVenueSearch(!showVenueSearch)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
                >
                  <Plus className="w-4 h-4" />
                  Добавить место
                </button>

                {/* Поиск мест */}
                {showVenueSearch && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={venueSearch}
                        onChange={(e) => setVenueSearch(e.target.value)}
                        placeholder="Поиск мест..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Результаты поиска */}
                    {searchResults.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                        {searchResults.map((venue) => (
                          <div
                            key={venue.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => addVenue(venue)}
                          >
                            <div className="font-medium text-gray-900">{venue.title}</div>
                            <div className="text-sm text-gray-500">{venue.address}</div>
                            <div className="text-sm text-gray-500">{venue.category.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Выбранные места */}
                {selectedVenues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Выбранные места:</h4>
                    {selectedVenues.map((venue) => (
                      <div
                        key={venue.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{venue.title}</div>
                          <div className="text-sm text-gray-500">{venue.address}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVenue(venue.id)}
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/collections?key=kidsreview2025"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Создание...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Создать подборку
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
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
                <div className="p-4">
                  {events.filter(event =>
                    event.title.toLowerCase().includes(eventSearch.toLowerCase())
                  ).map((event) => {
                    const isSelected = selectedEvents.find(e => e.id === event.id)
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
                              <div className="text-sm text-gray-500">{event.venue}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(event.startDate).toLocaleDateString('ru-RU')}
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
                    event.title.toLowerCase().includes(eventSearch.toLowerCase())
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
                    onClick={() => {
                      const availableEvents = events.filter(e => !selectedEvents.find(se => se.id === e.id))
                      if (availableEvents.length > 0) {
                        setSelectedEvents(prev => [...prev, ...availableEvents])
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Добавить все
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
      </div>
    </div>
  )
}
