'use client'

import { useState } from 'react'
import { useAdminKey } from '@/hooks/useAdminKey'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Filter } from 'lucide-react'

// Типы для фильтров
type FilterType = 'SEARCH' | 'DATE_TIME' | 'LOCATION' | 'PRICE' | 'CAPACITY' | 'AREA' | 'RATING' | 'AMENITIES' | 'CUSTOM'
type FilterScope = 'MAIN_VENUES' | 'VENUE_CATEGORY' | 'VENUE_SUBCATEGORY'

interface FilterConfig {
  id: number
  scope: FilterScope
  cityId?: number
  categoryId?: number
  subcategoryId?: string
  type: FilterType
  label: string
  key: string
  isRequired: boolean
  isVisible: boolean
  order: number
  config: unknown
}

// Моковые данные
const mockFilters: FilterConfig[] = [
  {
    id: 1,
    scope: 'MAIN_VENUES',
    type: 'SEARCH',
    label: 'Поиск',
    key: 'search',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { placeholder: 'Название места...' }
  },
  {
    id: 2,
    scope: 'MAIN_VENUES',
    type: 'DATE_TIME',
    label: 'Дата и время праздника',
    key: 'date_time',
    isRequired: false,
    isVisible: true,
    order: 2,
    config: { 
      includeTime: true,
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    }
  },
  {
    id: 3,
    scope: 'MAIN_VENUES',
    type: 'LOCATION',
    label: 'Район',
    key: 'district',
    isRequired: false,
    isVisible: true,
    order: 3,
    config: { 
      options: ['Любой', 'Центральный', 'Адмиралтейский', 'Василеостровский', 'Выборгский', 'Калининский', 'Кировский', 'Колпинский', 'Красногвардейский', 'Красносельский', 'Кронштадтский', 'Курортный', 'Московский', 'Невский', 'Петроградский', 'Петродворцовый', 'Приморский', 'Пушкинский', 'Фрунзенский']
    }
  },
  {
    id: 4,
    scope: 'MAIN_VENUES',
    type: 'PRICE',
    label: 'Цена 1 часа аренды',
    key: 'price',
    isRequired: false,
    isVisible: true,
    order: 4,
    config: { 
      ranges: [
        { label: 'До 1000₽', min: 0, max: 1000 },
        { label: '1000₽ - 2000₽', min: 1000, max: 2000 },
        { label: '2000₽ - 3000₽', min: 2000, max: 3000 },
        { label: 'От 3000₽', min: 3000, max: null }
      ]
    }
  },
  {
    id: 5,
    scope: 'VENUE_CATEGORY',
    categoryId: 1,
    type: 'AMENITIES',
    label: 'Что еще есть',
    key: 'amenities',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { 
      options: ['Кухня', 'Посуда', 'Фото зона', 'Парковка', 'Wi-Fi', 'Кондиционер']
    }
  }
]

const scopeLabels = {
  MAIN_VENUES: 'Основной раздел "Места"',
  VENUE_CATEGORY: 'Категории мест',
  VENUE_SUBCATEGORY: 'Подкатегории мест'
}

const typeLabels = {
  SEARCH: 'Поиск',
  DATE_TIME: 'Дата и время',
  LOCATION: 'Местоположение',
  PRICE: 'Цена',
  CAPACITY: 'Вместимость',
  AREA: 'Площадь',
  RATING: 'Рейтинг',
  AMENITIES: 'Удобства',
  CUSTOM: 'Пользовательский'
}

export default function FiltersPage() {
  const { keySuffix } = useAdminKey()

  const [filters, setFilters] = useState<FilterConfig[]>(mockFilters)
  const [selectedScope, setSelectedScope] = useState<FilterScope | 'ALL'>('ALL')
  const [selectedCity, setSelectedCity] = useState<number | 'ALL'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL')
  const [editingFilter, setEditingFilter] = useState<FilterConfig | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredFilters = filters.filter(filter => {
    if (selectedScope !== 'ALL' && filter.scope !== selectedScope) return false
    if (selectedCity !== 'ALL' && filter.cityId !== selectedCity) return false
    if (selectedCategory !== 'ALL' && filter.categoryId !== selectedCategory) return false
    return true
  })

  const toggleVisibility = (id: number) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, isVisible: !filter.isVisible } : filter
    ))
  }

  const deleteFilter = (id: number) => {
    setFilters(filters.filter(filter => filter.id !== id))
  }

  const editFilter = (filter: FilterConfig) => {
    setEditingFilter(filter)
  }

  const saveFilter = (updatedFilter: FilterConfig) => {
    setFilters(filters.map(filter => 
      filter.id === updatedFilter.id ? updatedFilter : filter
    ))
    setEditingFilter(null)
  }

  const cancelEdit = () => {
    setEditingFilter(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href="/admin" 
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление фильтрами</h1>
              <p className="mt-2 text-gray-600">Настройка фильтров для разных разделов сайта</p>
            </div>
          </div>

          {/* Controls - мобильная версия */}
          <div className="block md:hidden mb-6">
            <div className="space-y-4">
              <select 
                value={selectedScope} 
                onChange={(e) => setSelectedScope(e.target.value as FilterScope | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Все разделы</option>
                <option value="MAIN_VENUES">Основной раздел "Места"</option>
                <option value="VENUE_CATEGORY">Категории мест</option>
                <option value="VENUE_SUBCATEGORY">Подкатегории мест</option>
              </select>

              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Все города</option>
                <option value="1">Москва</option>
                <option value="2">Санкт-Петербург</option>
              </select>

              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Все категории</option>
                <option value="1">Мастер-классы</option>
                <option value="2">Прочий досуг</option>
                <option value="3">Спорт</option>
                <option value="4">Образование</option>
                <option value="5">Медицина</option>
                <option value="6">Лагеря</option>
                <option value="7">Няни</option>
              </select>

              <button 
                onClick={() => setShowAddModal(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить фильтр
              </button>
            </div>
          </div>

          {/* Controls - десктопная версия */}
          <div className="hidden md:flex flex-wrap gap-4 mb-6">
            <select 
              value={selectedScope} 
              onChange={(e) => setSelectedScope(e.target.value as FilterScope | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Все разделы</option>
              <option value="MAIN_VENUES">Основной раздел "Места"</option>
              <option value="VENUE_CATEGORY">Категории мест</option>
              <option value="VENUE_SUBCATEGORY">Подкатегории мест</option>
            </select>

            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Все города</option>
              <option value="1">Москва</option>
              <option value="2">Санкт-Петербург</option>
            </select>

            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Все категории</option>
              <option value="1">Мастер-классы</option>
              <option value="2">Прочий досуг</option>
              <option value="3">Спорт</option>
              <option value="4">Образование</option>
              <option value="5">Медицина</option>
              <option value="6">Лагеря</option>
              <option value="7">Няни</option>
            </select>

            <button 
              onClick={() => setShowAddModal(true)}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить фильтр
            </button>
          </div>
        </div>

        {/* Filters List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Фильтры ({filteredFilters.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFilters.map((filter) => (
              <div key={filter.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {scopeLabels[filter.scope]}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {typeLabels[filter.type]}
                      </span>
                      {filter.isRequired && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          Обязательный
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {filter.label}
                    </h3>
                    
                    <p className="text-sm text-gray-600">
                      Ключ: <code className="bg-gray-100 px-1 rounded">{filter.key}</code>
                      {filter.cityId && ` • Город: ${filter.cityId === 1 ? 'Москва' : 'СПб'}`}
                      {filter.categoryId && ` • Категория: ${filter.categoryId}`}
                      {filter.subcategoryId && ` • Подкатегория: ${filter.subcategoryId}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(filter.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        filter.isVisible 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={filter.isVisible ? 'Скрыть фильтр' : 'Показать фильтр'}
                    >
                      {filter.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button 
                      onClick={() => editFilter(filter)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Редактировать фильтр"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => deleteFilter(filter.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Config Preview */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Конфигурация:</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(filter.config, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {filteredFilters.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Фильтры не найдены</h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить параметры поиска или добавьте новый фильтр
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Добавить первый фильтр
              </button>
            </div>
          )}
        </div>

        {/* Edit Filter Modal */}
        {editingFilter && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Редактировать фильтр</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название фильтра
                  </label>
                  <input
                    type="text"
                    value={editingFilter.label}
                    onChange={(e) => setEditingFilter({...editingFilter, label: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ключ фильтра
                  </label>
                  <input
                    type="text"
                    value={editingFilter.key}
                    onChange={(e) => setEditingFilter({...editingFilter, key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingFilter.isRequired}
                      onChange={(e) => setEditingFilter({...editingFilter, isRequired: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Обязательный фильтр</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingFilter.isVisible}
                      onChange={(e) => setEditingFilter({...editingFilter, isVisible: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Видимый</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Порядок отображения
                  </label>
                  <input
                    type="number"
                    value={editingFilter.order}
                    onChange={(e) => setEditingFilter({...editingFilter, order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Конфигурация (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(editingFilter.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value)
                        setEditingFilter({...editingFilter, config})
                      } catch (err) {
                        // Игнорируем ошибки парсинга во время ввода
                      }
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => saveFilter(editingFilter)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Filter Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Добавить новый фильтр</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Раздел
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MAIN_VENUES">Основной раздел "Места"</option>
                      <option value="VENUE_CATEGORY">Категории мест</option>
                      <option value="VENUE_SUBCATEGORY">Подкатегории мест</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип фильтра
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SEARCH">Поиск</option>
                      <option value="DATE_TIME">Дата и время</option>
                      <option value="LOCATION">Местоположение</option>
                      <option value="PRICE">Цена</option>
                      <option value="CAPACITY">Вместимость</option>
                      <option value="AREA">Площадь</option>
                      <option value="RATING">Рейтинг</option>
                      <option value="AMENITIES">Удобства</option>
                      <option value="CUSTOM">Пользовательский</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название фильтра
                  </label>
                  <input
                    type="text"
                    placeholder="Введите название фильтра"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ключ фильтра
                  </label>
                  <input
                    type="text"
                    placeholder="Введите ключ фильтра"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">Обязательный фильтр</span>
                  </label>

                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Видимый</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
