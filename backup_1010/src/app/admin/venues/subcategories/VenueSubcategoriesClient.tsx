'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin, Building, Wrench } from 'lucide-react'
import { VenueSubcategory, VenueType } from '@prisma/client'
import { safeArray } from '@/lib/api-utils'

interface VenueSubcategoryWithDetails extends VenueSubcategory {
  category: {
    id: number
    name: string
  }
  citySubcategories: {
    city: {
      id: number
      name: string
    }
  }[]
  _count: {
    filters: number
    partners: number
  }
}

export function VenueSubcategoriesClient() {
  const [subcategories, setSubcategories] = useState<VenueSubcategoryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<VenueSubcategoryWithDetails | null>(null)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  useEffect(() => {
    fetchSubcategories()
  }, [])

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/admin/venues/subcategories?key=kidsreview2025')
      if (response.ok) {
        const data = await response.json()
        setSubcategories(data)
      } else {
        console.error('Error fetching subcategories:', response.status)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingSubcategory(null)
    setShowCreateModal(true)
  }

  const handleEdit = (subcategory: VenueSubcategoryWithDetails) => {
    setEditingSubcategory(subcategory)
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту подкатегорию?')) return

    try {
      const response = await fetch(`/api/admin/venues/subcategories/${id}?key=kidsreview2025`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchSubcategories()
      } else {
        alert('Ошибка при удалении подкатегории')
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      alert('Ошибка при удалении подкатегории')
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/venues/subcategories/${id}?key=kidsreview2025`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })
      
      if (response.ok) {
        await fetchSubcategories()
      } else {
        alert('Ошибка при изменении статуса подкатегории')
      }
    } catch (error) {
      console.error('Error toggling subcategory status:', error)
      alert('Ошибка при изменении статуса подкатегории')
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
        console.log('🔍 SUBCATEGORY MODAL: Icon uploaded successfully:', data.url);
      } else {
        console.error('🔍 SUBCATEGORY MODAL: Icon upload failed:', response.status);
        alert('Ошибка при загрузке иконки');
      }
    } catch (error) {
      console.error('🔍 SUBCATEGORY MODAL: Error uploading icon:', error);
      alert('Ошибка при загрузке иконки');
    } finally {
      setUploadingIcon(false);
    }
  };

  const getTypeIcon = (type: VenueType) => {
    return type === 'PLACE' ? <Building className="w-4 h-4" /> : <Wrench className="w-4 h-4" />
  }

  const getTypeLabel = (type: VenueType) => {
    return type === 'PLACE' ? 'Место' : 'Услуга'
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
          Создать подкатегорию
        </button>
      </div>

      {/* Таблица подкатегорий */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип
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
                  Фильтры
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Партнеры
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
              {subcategories.map((subcategory) => (
                <tr key={subcategory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                    <div className="text-sm text-gray-500">{subcategory.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subcategory.category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {getTypeIcon(subcategory.type)}
                      <span className="ml-1">{getTypeLabel(subcategory.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subcategory.icon ? (
                      <div className="flex items-center">
                        {subcategory.icon.startsWith('http') || subcategory.icon.startsWith('/') ? (
                          <img
                            src={subcategory.icon}
                            alt={subcategory.name}
                            className="w-8 h-8 object-contain rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${subcategory.icon.startsWith('http') || subcategory.icon.startsWith('/') ? 'hidden' : ''}`}
                          style={{ backgroundColor: subcategory.color || '#6B7280' }}
                        >
                          <span className="text-white text-sm">{subcategory.icon}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subcategory.color ? (
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: subcategory.color }}
                        ></div>
                        <span className="text-sm text-gray-900">{subcategory.color}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {subcategory.citySubcategories.length} городов
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {subcategory.citySubcategories.slice(0, 3).map(cs => cs.city.name).join(', ')}
                      {subcategory.citySubcategories.length > 3 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{subcategory._count.filters}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{subcategory._count.partners}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(subcategory.id, subcategory.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subcategory.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subcategory.isActive ? (
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
                        onClick={() => handleEdit(subcategory)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subcategory.id)}
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
        <SubcategoryModal
          subcategory={editingSubcategory}
          onClose={() => {
            setShowCreateModal(false)
            setEditingSubcategory(null)
          }}
          onSave={fetchSubcategories}
        />
      )}
    </div>
  )
}

// Компонент модального окна для создания/редактирования подкатегории
function SubcategoryModal({ 
  subcategory, 
  onClose, 
  onSave 
}: { 
  subcategory: VenueSubcategoryWithDetails | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState(() => ({
    name: subcategory?.name ?? '',
    slug: subcategory?.slug ?? '',
    type: subcategory?.type ?? 'PLACE' as VenueType,
    categoryId: subcategory?.categoryId ?? 0,
    icon: subcategory?.icon ?? '',
    color: subcategory?.color ?? '#3B82F6',
    backgroundImage: subcategory?.backgroundImage ?? '',
    cityIds: subcategory?.citySubcategories?.map(cs => cs.city.id) ?? [],
    isActive: subcategory?.isActive ?? true
  }))
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingBackground, setUploadingBackground] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchCities()
  }, [])

  // Словарь переводов с русского на английский
  const russianToEnglish = {
    'зоопарки': 'zoo',
    'зоопарк': 'zoo',
    'парки': 'parks',
    'парк': 'park',
    'музеи': 'museums',
    'музей': 'museum',
    'театры': 'theaters',
    'театр': 'theater',
    'кинотеатры': 'cinemas',
    'кинотеатр': 'cinema',
    'рестораны': 'restaurants',
    'ресторан': 'restaurant',
    'кафе': 'cafes',
    'кафе': 'cafe',
    'спорт': 'sport',
    'спортивные': 'sports',
    'бассейны': 'pools',
    'бассейн': 'pool',
    'фитнес': 'fitness',
    'йога': 'yoga',
    'танцы': 'dancing',
    'танцевальные': 'dance',
    'музыка': 'music',
    'музыкальные': 'musical',
    'образование': 'education',
    'образовательные': 'educational',
    'школы': 'schools',
    'школа': 'school',
    'детские': 'children',
    'детский': 'children',
    'сады': 'gardens',
    'сад': 'garden',
    'развлечения': 'entertainment',
    'развлекательные': 'entertainment',
    'игры': 'games',
    'игра': 'game',
    'квесты': 'quests',
    'квест': 'quest',
    'vr': 'vr',
    'виртуальная': 'virtual',
    'реальность': 'reality',
    'боулинг': 'bowling',
    'караоке': 'karaoke',
    'бильярд': 'billiards',
    'настольные': 'board',
    'красота': 'beauty',
    'здоровье': 'health',
    'спа': 'spa',
    'массаж': 'massage',
    'маникюр': 'manicure',
    'парикмахерская': 'hairdresser',
    'косметология': 'cosmetology',
    'стоматология': 'dentistry',
    'медицина': 'medicine',
    'медицинские': 'medical',
    'логопед': 'speech-therapist',
    'психолог': 'psychologist',
    'лагеря': 'camps',
    'лагерь': 'camp',
    'летние': 'summer',
    'зимние': 'winter',
    'спортивные': 'sports',
    'творческие': 'creative',
    'обучающие': 'educational'
  }

  // Функция для генерации slug с переводом
  const generateSlug = (text: string) => {
    let result = text.toLowerCase()
    
    // Заменяем русские слова на английские
    Object.entries(russianToEnglish).forEach(([russian, english]) => {
      const regex = new RegExp(russian, 'gi')
      result = result.replace(regex, english)
    })
    
    // Очищаем от лишних символов и создаем slug
    return result
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Автоматическая генерация slug из названия
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = generateSlug(formData.name)
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])

  // Функция для генерации уникального slug
  const generateUniqueSlug = async (baseSlug: string) => {
    let uniqueSlug = baseSlug
    let counter = 1
    
    while (true) {
      try {
        const response = await fetch(`/api/admin/venues/subcategories/check-slug?slug=${uniqueSlug}`)
        if (response.ok) {
          const data = await response.json()
          if (!data.exists) {
            return uniqueSlug
          }
        }
        uniqueSlug = `${baseSlug}-${counter}`
        counter++
      } catch (error) {
        console.error('Error checking slug uniqueness:', error)
        return uniqueSlug
      }
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/venues/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCities = async () => {
    try {
      console.log('🔍 SUBCATEGORY MODAL: Fetching cities...')
      const response = await fetch('/api/admin/cities')
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 SUBCATEGORY MODAL: Cities API response:', data)
        // API возвращает { cities: [...] }, нужно извлечь массив
        const citiesArray = data.cities || []
        console.log('🔍 SUBCATEGORY MODAL: Cities array:', citiesArray)
        setCities(safeArray(citiesArray))
      } else {
        console.error('🔍 SUBCATEGORY MODAL: Cities API error:', response.status)
      }
    } catch (error) {
      console.error('🔍 SUBCATEGORY MODAL: Error fetching cities:', error)
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
        console.log('🔍 SUBCATEGORY MODAL: Icon uploaded successfully:', data.url);
      } else {
        console.error('🔍 SUBCATEGORY MODAL: Icon upload failed:', response.status);
        alert('Ошибка при загрузке иконки');
      }
    } catch (error) {
      console.error('🔍 SUBCATEGORY MODAL: Error uploading icon:', error);
      alert('Ошибка при загрузке иконки');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBackground(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'background');

      const response = await fetch(`/api/admin/upload?key=kidsreview2025`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, backgroundImage: data.url }));
        console.log('🔍 SUBCATEGORY MODAL: Background uploaded successfully:', data.url);
      } else {
        console.error('🔍 SUBCATEGORY MODAL: Background upload failed:', response.status);
        alert('Ошибка при загрузке фонового изображения');
      }
    } catch (error) {
      console.error('🔍 SUBCATEGORY MODAL: Error uploading background:', error);
      alert('Ошибка при загрузке фонового изображения');
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = subcategory 
        ? `/api/admin/venues/subcategories/${subcategory.id}?key=kidsreview2025`
        : '/api/admin/venues/subcategories?key=kidsreview2025'
      
      const method = subcategory ? 'PATCH' : 'POST'
      
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
        if (response.status === 409) {
          alert(`Подкатегория с таким названием или slug уже существует: ${error.existingSubcategory?.name || 'неизвестно'}`)
        } else {
          alert(error.error || error.message || 'Ошибка при сохранении подкатегории')
        }
      }
    } catch (error) {
      console.error('Error saving subcategory:', error)
      alert('Ошибка при сохранении подкатегории')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {subcategory ? 'Редактировать подкатегорию' : 'Создать подкатегорию'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Название
              </label>
              <input
                type="text"
                value={formData.name ?? ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug (URL)
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={formData.slug ?? ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-slug"
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={async () => {
                    const baseSlug = generateSlug(formData.name)
                    const uniqueSlug = await generateUniqueSlug(baseSlug)
                    setFormData(prev => ({ ...prev, slug: uniqueSlug }))
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Авто
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Автоматически генерируется из названия с переводом на английский
              </div>
              {formData.name && (
                <div className="text-xs text-blue-600 mt-1">
                  Предпросмотр: {generateSlug(formData.name)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Тип
              </label>
              <select
                value={formData.type ?? 'PLACE'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VenueType })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="PLACE">Место</option>
                <option value="SERVICE">Услуга</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Категория
              </label>
              <select
                value={formData.categoryId ?? 0}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value={0}>Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Иконка
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="text"
                  value={formData.icon ?? ''}
                  onChange={(e) => {
                    console.log('Icon input changed:', e.target.value)
                    setFormData(prev => ({ ...prev, icon: e.target.value }))
                  }}
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
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.color ?? '#3B82F6'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Фоновое изображение
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="text"
                  value={formData.backgroundImage ?? ''}
                  onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                  placeholder="URL изображения"
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                  id="background-upload"
                />
                <label
                  htmlFor="background-upload"
                  className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                    uploadingBackground ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingBackground ? 'Загрузка...' : 'Загрузить'}
                </label>
              </div>
              {formData.backgroundImage && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Предпросмотр:</span>
                  <img
                    src={formData.backgroundImage}
                    alt="Background preview"
                    className="mt-1 w-32 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
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
                      checked={formData.cityIds.includes(city.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            cityIds: [...formData.cityIds, city.id]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            cityIds: formData.cityIds.filter(id => id !== city.id)
                          })
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

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Активно</span>
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
                {loading ? 'Сохранение...' : (subcategory ? 'Сохранить' : 'Создать')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

