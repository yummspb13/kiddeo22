'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Filter } from 'lucide-react'
import { VenueFilter } from '@prisma/client'

interface VenueFilterWithSubcategory extends VenueFilter {
  subcategory: {
    id: number
    name: string
    category: {
      name: string
    }
  }
}

interface VenueSubcategory {
  id: number
  name: string
  category: {
    name: string
  }
}

export function VenueFiltersClient() {
  const [filters, setFilters] = useState<VenueFilterWithSubcategory[]>([])
  const [subcategories, setSubcategories] = useState<VenueSubcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFilter, setEditingFilter] = useState<VenueFilterWithSubcategory | null>(null)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null)

  useEffect(() => {
    fetchFilters()
    fetchSubcategories()
  }, [])

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/admin/venues/filters')
      if (response.ok) {
        const data = await response.json()
        setFilters(data)
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/admin/venues/subcategories')
      if (response.ok) {
        const data = await response.json()
        setSubcategories(data)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const handleCreate = (subcategoryId: number) => {
    setSelectedSubcategoryId(subcategoryId)
    setEditingFilter(null)
    setShowCreateModal(true)
  }

  const handleEdit = (filter: VenueFilterWithSubcategory) => {
    setSelectedSubcategoryId(filter.subcategoryId)
    setEditingFilter(filter)
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот фильтр?')) return

    try {
      const response = await fetch(`/api/admin/venues/filters/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchFilters()
      } else {
        alert('Ошибка при удалении фильтра')
      }
    } catch (error) {
      console.error('Error deleting filter:', error)
      alert('Ошибка при удалении фильтра')
    }
  }

  const handleToggleVisible = async (id: number, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/venues/filters/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVisible: !isVisible }),
      })
      
      if (response.ok) {
        await fetchFilters()
      } else {
        alert('Ошибка при изменении видимости фильтра')
      }
    } catch (error) {
      console.error('Error toggling filter visibility:', error)
      alert('Ошибка при изменении видимости фильтра')
    }
  }

  const handleMoveUp = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/venues/filters/${id}/move-up`, {
        method: 'POST',
      })
      
      if (response.ok) {
        await fetchFilters()
      } else {
        alert('Ошибка при перемещении фильтра')
      }
    } catch (error) {
      console.error('Error moving filter up:', error)
      alert('Ошибка при перемещении фильтра')
    }
  }

  const handleMoveDown = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/venues/filters/${id}/move-down`, {
        method: 'POST',
      })
      
      if (response.ok) {
        await fetchFilters()
      } else {
        alert('Ошибка при перемещении фильтра')
      }
    } catch (error) {
      console.error('Error moving filter down:', error)
      alert('Ошибка при перемещении фильтра')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Получаем фильтры для выбранной подкатегории
  const currentFilters = selectedSubcategoryId 
    ? filters.filter(f => f.subcategoryId === selectedSubcategoryId).sort((a, b) => a.order - b.order)
    : []

  const currentSubcategory = selectedSubcategoryId 
    ? subcategories.find(s => s.id === selectedSubcategoryId)
    : null

  const getFilterTypeDescription = (filter: VenueFilterWithSubcategory) => {
    try {
      const config = typeof filter.config === 'string' ? JSON.parse(filter.config) : filter.config
      const type = config?.type || 'unknown'
      
      switch (type) {
        case 'select':
          const selectOptions = config?.options || []
          return (
            <div className="bg-blue-50 p-2 rounded text-xs">
              <span className="font-medium text-blue-800">Выпадающий список:</span>
              <span className="ml-2">{selectOptions.join(', ')}</span>
            </div>
          )
        case 'radio':
          const radioOptions = config?.options || []
          return (
            <div className="bg-green-50 p-2 rounded text-xs">
              <span className="font-medium text-green-800">Radio-кнопки:</span>
              <span className="ml-2">{radioOptions.join(', ')}</span>
            </div>
          )
        case 'checkbox':
          const checkboxOptions = config?.options || []
          return (
            <div className="bg-purple-50 p-2 rounded text-xs">
              <span className="font-medium text-purple-800">Множественный выбор:</span>
              <span className="ml-2">{checkboxOptions.join(', ')}</span>
            </div>
          )
        case 'range':
          return (
            <div className="bg-orange-50 p-2 rounded text-xs">
              <span className="font-medium text-orange-800">Диапазон:</span>
              <span className="ml-2">от {config?.min || 0} до {config?.max || 100}</span>
            </div>
          )
        case 'boolean':
          return (
            <div className="bg-gray-50 p-2 rounded text-xs">
              <span className="font-medium text-gray-800">Да/Нет</span>
            </div>
          )
        case 'text':
          return (
            <div className="bg-yellow-50 p-2 rounded text-xs">
              <span className="font-medium text-yellow-800">Текстовый поиск</span>
            </div>
          )
        default:
          return (
            <div className="bg-gray-100 p-2 rounded text-xs">
              <span className="text-gray-600">Неизвестный тип: {type}</span>
            </div>
          )
      }
    } catch (e) {
      return (
        <div className="bg-red-50 p-2 rounded text-xs">
          <span className="text-red-800">Ошибка конфигурации</span>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Фильтры подкатегорий</h1>
          <p className="text-gray-600">Управление фильтрами для поиска и фильтрации мест</p>
        </div>
      </div>

      {/* Двухпанельный интерфейс */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая панель - подкатегории */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Подкатегории</h3>
              <p className="text-sm text-gray-500">Выберите подкатегорию для управления фильтрами</p>
            </div>
            <div className="divide-y divide-gray-200">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedSubcategoryId(subcategory.id)}
                  className={`w-full px-6 py-4 text-left hover:bg-gray-50 ${
                    selectedSubcategoryId === subcategory.id
                      ? 'bg-blue-50 border-r-2 border-blue-500'
                      : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                  <div className="text-sm text-gray-500">{subcategory.category.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {filters.filter(f => f.subcategoryId === subcategory.id).length} фильтров
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая панель - фильтры */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentSubcategory ? `Фильтры: ${currentSubcategory.name}` : 'Выберите подкатегорию'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentSubcategory ? 'Управление фильтрами для выбранной подкатегории' : 'Сначала выберите подкатегорию слева'}
                  </p>
                </div>
                {currentSubcategory && (
                  <button
                    onClick={() => handleCreate(currentSubcategory.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Создать фильтр
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {!currentSubcategory ? (
                <div className="text-center py-12 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Выберите подкатегорию для управления фильтрами</p>
                </div>
              ) : currentFilters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Фильтры не созданы</p>
                  <p className="text-sm">Нажмите "Создать фильтр" чтобы добавить первый фильтр</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentFilters.map((filter, index) => (
                    <div key={filter.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">{filter.name}</h4>
                            <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {filter.key}
                            </code>
                            <button
                              onClick={() => handleToggleVisible(filter.id, filter.isVisible)}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                filter.isVisible
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {filter.isVisible ? (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Видимый
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Скрытый
                                </>
                              )}
                            </button>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {getFilterTypeDescription(filter)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleMoveUp(filter.id)}
                              className="text-gray-400 hover:text-gray-600"
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-500">{filter.order}</span>
                            <button
                              onClick={() => handleMoveDown(filter.id)}
                              className="text-gray-400 hover:text-gray-600"
                              disabled={index === currentFilters.length - 1}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleEdit(filter)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(filter.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно создания/редактирования фильтра */}
      {showCreateModal && (
        <FilterModal
          filter={editingFilter}
          subcategoryId={selectedSubcategoryId}
          onClose={() => {
            setShowCreateModal(false)
            setEditingFilter(null)
            setSelectedSubcategoryId(null)
          }}
          onSave={fetchFilters}
        />
      )}
    </div>
  )
}

// Компонент модального окна для создания/редактирования фильтра
function FilterModal({ 
  filter, 
  subcategoryId,
  onClose, 
  onSave 
}: { 
  filter: VenueFilterWithSubcategory | null
  subcategoryId: number | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: filter?.name || '',
    key: filter?.key || '',
    isVisible: filter?.isVisible ?? true,
    type: (filter?.config as any)?.type || 'select',
    config: filter?.config || {}
  })
  
  // Отдельные состояния для полей конфигурации
  const [optionsText, setOptionsText] = useState(() => {
    if (filter?.config && typeof filter.config === 'object' && 'options' in filter.config) {
      return (filter.config.options as string[])?.join('\n') || ''
    }
    return ''
  })
  
  const [minValue, setMinValue] = useState(() => {
    if (filter?.config && typeof filter.config === 'object' && 'min' in filter.config) {
      return (filter.config.min as number) || 0
    }
    return 0
  })
  
  const [maxValue, setMaxValue] = useState(() => {
    if (filter?.config && typeof filter.config === 'object' && 'max' in filter.config) {
      return (filter.config.max as number) || 100
    }
    return 100
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!filter && formData.name) {
      // Автогенерация ключа из названия (только английские буквы)
      const key = formData.name
        .toLowerCase()
        .replace(/[а-яё]/g, (char) => {
          // Транслитерация кириллицы в латиницу
          const translitMap: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          }
          return translitMap[char] || char
        })
        .replace(/[^a-z0-9\s-]/g, '') // Только латинские буквы, цифры, пробелы и дефисы
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') // Убираем дефисы в начале и конце
      setFormData(prev => ({ ...prev, key }))
    }
  }, [formData.name, filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = filter 
        ? `/api/admin/venues/filters/${filter.id}`
        : '/api/admin/venues/filters'
      
      const method = filter ? 'PUT' : 'POST'
      
      // Создаем конфигурацию в зависимости от типа фильтра
      let config = { type: formData.type }
      
      switch (formData.type) {
        case 'select':
        case 'radio':
        case 'checkbox':
          const options = optionsText.split('\n').filter(opt => opt.trim())
          config = { type: formData.type, options } as any
          break
        case 'range':
          config = { type: formData.type, min: minValue, max: maxValue } as any
          break
        case 'boolean':
          config = { type: formData.type }
          break
        default:
          config = { type: formData.type }
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          key: formData.key,
          isVisible: formData.isVisible,
          config: config,
          subcategoryId: subcategoryId || filter?.subcategoryId
        }),
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const error = await response.json()
        alert(error.message || 'Ошибка при сохранении фильтра')
      }
    } catch (error) {
      console.error('Error saving filter:', error)
      alert('Ошибка при сохранении фильтра')
    } finally {
      setLoading(false)
    }
  }

  const renderConfigField = () => {
    switch (formData.type) {
      case 'select':
      case 'radio':
      case 'checkbox':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Варианты (по одному на строку)
            </label>
            <textarea
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={`Вариант 1\nВариант 2\nВариант 3`}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.type === 'select' && 'Пользователь сможет выбрать один вариант из списка'}
              {formData.type === 'radio' && 'Пользователь сможет выбрать один вариант из радио-кнопок'}
              {formData.type === 'checkbox' && 'Пользователь сможет выбрать несколько вариантов'}
            </p>
          </div>
        )
      case 'range':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Минимальное значение
              </label>
              <input
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Максимальное значение
              </label>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(parseInt(e.target.value) || 100)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">
                Пользователь сможет выбрать диапазон значений (например, цена от {minValue} до {maxValue})
              </p>
            </div>
          </div>
        )
      case 'boolean':
        return (
          <div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              Фильтр типа "Да/Нет" не требует дополнительной настройки.
              <br />
              Пример: "Есть парковка", "Работает по выходным", "Принимает карты"
            </p>
          </div>
        )
      case 'text':
        return (
          <div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              Текстовый поиск позволяет пользователям искать по ключевым словам.
              <br />
              Пример: поиск по названию, описанию, адресу
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {filter ? 'Редактировать фильтр' : 'Создать фильтр'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Название
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ключ
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Автоматически генерируется из названия
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Тип фильтра
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="select">Выпадающий список</option>
                <option value="radio">Radio-кнопки</option>
                <option value="checkbox">Множественный выбор</option>
                <option value="range">Диапазон значений</option>
                <option value="boolean">Да/Нет</option>
                <option value="text">Текстовый поиск</option>
              </select>
            </div>

            {renderConfigField()}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Видимый</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : (filter ? 'Сохранить' : 'Создать')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

