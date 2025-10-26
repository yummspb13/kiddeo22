'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin } from 'lucide-react'
import { VenueCategory } from '@prisma/client'
import { safeArray } from '@/lib/api-utils'

interface VenueCategoryWithCities extends VenueCategory {
  cityCategories: {
    city: {
      id: number
      name: string
    }
  }[]
}

export function VenueCategoriesClient() {
  const [categories, setCategories] = useState<VenueCategoryWithCities[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<VenueCategoryWithCities | null>(null)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<VenueCategoryWithCities | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/venues/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setShowCreateModal(true)
  }

  const handleEdit = (category: VenueCategoryWithCities) => {
    setEditingCategory(category)
    setShowCreateModal(true)
  }

  const handleManageSubcategories = (category: VenueCategoryWithCities) => {
    setSelectedCategory(category)
    setShowSubcategoryModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

    try {
      const response = await fetch(`/api/admin/venues/categories/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchCategories()
      } else {
        alert('Ошибка при удалении категории')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Ошибка при удалении категории')
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/venues/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })
      
      if (response.ok) {
        await fetchCategories()
      } else {
        alert('Ошибка при изменении статуса категории')
      }
    } catch (error) {
      console.error('Error toggling category status:', error)
      alert('Ошибка при изменении статуса категории')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Кнопка создания */}
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать категорию
        </button>
      </div>

      {/* Таблица категорий */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Иконка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цвет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Активные города
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
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.icon ? (
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        >
                          <span className="text-white text-sm">{category.icon}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.color ? (
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm text-gray-900">{category.color}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {category.cityCategories.length} городов
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.cityCategories.slice(0, 3).map(cc => cc.city.name).join(', ')}
                      {category.cityCategories.length > 3 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(category.id, category.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.isActive ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Активно
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Скрыто
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
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

      {/* Модальное окно создания/редактирования */}
      {showCreateModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCategory(null)
          }}
          onSave={fetchCategories}
        />
      )}
    </div>
  )
}

// Компонент модального окна для создания/редактирования категории
function CategoryModal({ 
  category, 
  onClose, 
  onSave 
}: { 
  category: VenueCategoryWithCities | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState(() => ({
    name: category?.name ?? '',
    icon: category?.icon ?? '',
    color: category?.color ?? '#3B82F6',
    cityIds: category?.cityCategories?.map(cc => cc.city.id) ?? []
  }))
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      console.log('🔍 CATEGORY MODAL: Fetching cities...')
      const response = await fetch('/api/admin/cities')
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 CATEGORY MODAL: Cities API response:', data)
        // API возвращает { cities: [...] }, нужно извлечь массив
        const citiesArray = data.cities || []
        console.log('🔍 CATEGORY MODAL: Cities array:', citiesArray)
        setCities(safeArray(citiesArray))
      } else {
        console.error('🔍 CATEGORY MODAL: Cities API error:', response.status)
      }
    } catch (error) {
      console.error('🔍 CATEGORY MODAL: Error fetching cities:', error)
    }
  }

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'icon');

      const response = await fetch(`/api/admin/upload?key=kidsreview2025`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, icon: data.url }));
        console.log('🔍 CATEGORY MODAL: Icon uploaded successfully:', data.url);
      } else {
        console.error('🔍 CATEGORY MODAL: Icon upload failed:', response.status);
        alert('Ошибка при загрузке иконки');
      }
    } catch (error) {
      console.error('🔍 CATEGORY MODAL: Error uploading icon:', error);
      alert('Ошибка при загрузке иконки');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = category 
        ? `/api/admin/venues/categories/${category.id}`
        : '/api/admin/venues/categories'
      
      const method = category ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const error = await response.json()
        alert(error.message || 'Ошибка при сохранении категории')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Ошибка при сохранении категории')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {category ? 'Редактировать категорию' : 'Создать категорию'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Название
              </label>
              <input
                type="text"
                value={formData.name ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Иконка
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="text"
                  value={formData.icon ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🎨 или URL иконки"
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                  id="icon-upload"
                />
                <label
                  htmlFor="icon-upload"
                  className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                    uploadingIcon ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingIcon ? 'Загрузка...' : 'Загрузить'}
                </label>
              </div>
              {formData.icon && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Предпросмотр:</span>
                  {formData.icon.startsWith('http') || formData.icon.startsWith('/') ? (
                    <img
                      src={formData.icon}
                      alt="Icon preview"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-2xl">{formData.icon}</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Цвет
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color ?? '#3B82F6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-8 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.color ?? '#3B82F6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Активные города
              </label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {Array.isArray(cities) ? cities.map((city) => (
                  <label key={city.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cityIds?.includes(city.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            cityIds: [...(prev.cityIds || []), city.id]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            cityIds: (prev.cityIds || []).filter(id => id !== city.id)
                          }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{city.name}</span>
                  </label>
                )) : (
                  <div className="text-sm text-gray-500">Загрузка городов...</div>
                )}
              </div>
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
                {loading ? 'Сохранение...' : (category ? 'Сохранить' : 'Создать')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

