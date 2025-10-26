'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Search, GripVertical, Trash2, Calendar, DollarSign, Eye } from 'lucide-react'

interface HomePageAd {
  id: number
  blockType: string
  citySlug: string
  contentType: string
  contentId: string
  order: number
  isActive: boolean
  startsAt?: string
  endsAt?: string
  isPaid: boolean
  clicks: number
  views: number
  content?: any
}

const BLOCK_TYPES = {
  'POPULAR_EVENTS': 'Популярные события',
  'POPULAR_VENUES': 'Популярные места',
  'POPULAR_SERVICES': 'Популярные услуги',
  'CATEGORIES': 'Категории',
  'COLLECTIONS': 'Подборки',
  'RECOMMENDED': 'Рекомендуем',
  'NEW_IN_CATALOG': 'Новые в каталоге',
  'BLOG_POSTS': 'Полезные статьи'
}

const CONTENT_TYPES = {
  'EVENT': 'Событие',
  'VENUE': 'Место',
  'SERVICE': 'Услуга',
  'BLOG_POST': 'Статья',
  'CATEGORY': 'Категория'
}

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState('POPULAR_EVENTS')
  const [selectedCity, setSelectedCity] = useState('moscow')
  const [ads, setAds] = useState<HomePageAd[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState('EVENT')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPaid, setIsPaid] = useState(true)

  useEffect(() => {
    fetchAds()
  }, [activeTab, selectedCity])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/homepage/ads?blockType=${activeTab}&citySlug=${selectedCity}&key=kidsreview2025`)
      const data = await response.json()
      setAds(data)
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setSearchLoading(true)
      const query = searchQuery.trim() ? `&q=${encodeURIComponent(searchQuery)}` : ''
      const response = await fetch(`/api/admin/homepage/ads/search?contentType=${selectedContentType}&citySlug=${selectedCity}${query}&key=kidsreview2025`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching content:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Автоматически загружать контент при открытии модального окна или изменении типа контента
  useEffect(() => {
    if (showAddModal) {
      handleSearch()
    }
  }, [showAddModal, selectedContentType])

  // Автоматически выбирать тип контента для категорий
  useEffect(() => {
    if (activeTab === 'CATEGORIES') {
      setSelectedContentType('CATEGORY')
    }
  }, [activeTab])

  const handleAddContent = async (content: any) => {
    try {
      const response = await fetch('/api/admin/homepage/ads?key=kidsreview2025', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType: activeTab,
          citySlug: selectedCity,
          contentType: selectedContentType,
          contentId: content.id,
          order: ads.length,
          isActive: true,
          isPaid: isPaid,
          startsAt: startDate || null,
          endsAt: endDate || null
        })
      })

      if (response.ok) {
        await fetchAds()
        setShowAddModal(false)
        setSearchQuery('')
        setSearchResults([])
        setStartDate('')
        setEndDate('')
        setIsPaid(true)
        alert('Контент добавлен в блок!')
      }
    } catch (error) {
      console.error('Error adding content:', error)
      alert('Ошибка при добавлении контента')
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newAds = Array.from(ads)
    const [reorderedItem] = newAds.splice(result.source.index, 1)
    newAds.splice(result.destination.index, 0, reorderedItem)

    const updatedAds = newAds.map((ad, index) => ({
      ...ad,
      order: index
    }))

    setAds(updatedAds)
    saveOrder(updatedAds)
  }

  const saveOrder = async (updatedAds: HomePageAd[]) => {
    try {
      await fetch('/api/admin/homepage/ads?key=kidsreview2025', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: updatedAds.map(ad => ({ id: ad.id, order: ad.order }))
        })
      })
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }

  const handleDeleteAd = async (adId: number) => {
    if (!confirm('Удалить этот контент из блока?')) return

    try {
      const response = await fetch(`/api/admin/homepage/ads?id=${adId}&key=kidsreview2025`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAds()
        alert('Контент удален из блока!')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('Ошибка при удалении контента')
    }
  }

  const getDaysUntilExpiry = (endsAt?: string) => {
    if (!endsAt) return null
    const now = new Date()
    const endDate = new Date(endsAt)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление рекламой</h1>
          <p className="text-sm text-gray-600">Добавляйте и настраивайте рекламный контент для блоков главной страницы</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="moscow">Москва</option>
            <option value="sankt-peterburg">Санкт-Петербург</option>
          </select>
        </div>
      </div>

      {/* Вкладки блоков */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {Object.entries(BLOCK_TYPES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Кнопка добавления */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {BLOCK_TYPES[activeTab as keyof typeof BLOCK_TYPES]}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить контент
        </button>
      </div>

      {/* Список рекламного контента */}
      <div className="bg-white rounded-lg shadow">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ads">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-gray-200">
                {ads.map((ad, index) => {
                  const daysUntilExpiry = getDaysUntilExpiry(ad.endsAt)
                  
                  return (
                    <Draggable key={ad.id} draggableId={ad.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 flex items-center space-x-4 ${
                            snapshot.isDragging ? 'bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="p-2 text-gray-400 hover:text-gray-600 cursor-grab"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">
                                {ad.content?.title || `Контент ${ad.contentId}`}
                              </h3>
                              <span className="text-sm text-gray-500">
                                ({CONTENT_TYPES[ad.contentType as keyof typeof CONTENT_TYPES]})
                              </span>
                              {ad.isPaid && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Реклама
                                </span>
                              )}
                            </div>
                            
                            {ad.content?.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {ad.content.description}
                              </p>
                            )}
                            
                            {/* Дополнительная информация о контенте */}
                            {ad.content && (
                              <div className="mt-2 text-xs text-gray-500 space-y-1">
                                {ad.content.venue && (
                                  <div>📍 {ad.content.venue}</div>
                                )}
                                {ad.content.organizer && (
                                  <div>🎭 {ad.content.organizer}</div>
                                )}
                                {ad.content.startDate && (
                                  <div>📅 {new Date(ad.content.startDate).toLocaleDateString('ru-RU')}</div>
                                )}
                                {ad.content.priceFrom && (
                                  <div>💰 От {ad.content.priceFrom} ₽</div>
                                )}
                                {ad.content.count !== undefined && (
                                  <div>🏢 {ad.content.count} мест</div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Порядок: {ad.order + 1}</span>
                              <span>Просмотры: {ad.views}</span>
                              <span>Клики: {ad.clicks}</span>
                              {daysUntilExpiry !== null && (
                                <span className={daysUntilExpiry <= 3 ? 'text-red-600 font-medium' : ''}>
                                  Осталось дней: {daysUntilExpiry}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Модальное окно добавления контента */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить контент</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип контента
                </label>
                <select
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CONTENT_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск контента..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Поля для настройки рекламы */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата начала показа
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата окончания показа
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Платная реклама (с пометкой "Реклама")
                    </span>
                  </label>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((content) => (
                    <div
                      key={content.id}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddContent(content)}
                    >
                      <div className="flex items-start space-x-3">
                        {content.image && (
                          <img
                            src={content.image}
                            alt={content.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        {content.icon && (
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                            <img
                              src={content.icon}
                              alt={content.title}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{content.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            {content.price && <span>От {content.price} ₽</span>}
                            {content.location && <span>{content.location}</span>}
                            {content.date && <span>{new Date(content.date).toLocaleDateString()}</span>}
                            {content.count !== undefined && <span>{content.count} мест</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
