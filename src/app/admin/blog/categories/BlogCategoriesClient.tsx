'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Search } from 'lucide-react'

interface BlogCategory {
  id: number
  name: string
  slug: string
  description?: string
  color?: string
  isActive: boolean
  sortOrder: number
  postCount: number
  createdAt: string
  updatedAt: string
}

interface BlogCategoriesClientProps {
  initialCategories: BlogCategory[]
}

export default function BlogCategoriesClient({ initialCategories }: BlogCategoriesClientProps) {
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    sortOrder: 0,
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      sortOrder: 0,
      isActive: true
    })
    setError(null)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-я\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleCreate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category')
      }

      setCategories([...categories, data.category])
      setShowCreateForm(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingCategory) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/blog/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category')
      }

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? data.category : cat
      ))
      setEditingCategory(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category')
      }

      setCategories(categories.filter(cat => cat.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const category = categories.find(cat => cat.id === id)
      if (!category) return

      const response = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          isActive: !isActive
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category')
      }

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, isActive: !isActive } : cat
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
      sortOrder: category.sortOrder,
      isActive: category.isActive
    })
    setShowCreateForm(true)
  }

  const handleCreateNew = () => {
    setEditingCategory(null)
    resetForm()
    setShowCreateForm(true)
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingCategory(null)
    resetForm()
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Поиск и кнопка создания */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск категорий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать категорию
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Введите название категории"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="url-slug"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Описание категории"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвет
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Порядок сортировки
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700">Активна</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={editingCategory ? handleUpdate : handleCreate}
              disabled={isLoading || !formData.name || !formData.slug}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Сохранение...' : (editingCategory ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </div>
      )}

      {/* Список категорий */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Категории ({filteredCategories.length})
          </h3>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            {searchTerm ? 'Категории не найдены' : 'Категории не созданы'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <div key={category.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {category.name}
                        </h4>
                        {!category.isActive && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            Неактивна
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {category.description || 'Без описания'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span>Slug: {category.slug}</span>
                        <span>Статей: {category.postCount}</span>
                        <span>Порядок: {category.sortOrder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(category.id, category.isActive)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={category.isActive ? 'Деактивировать' : 'Активировать'}
                    >
                      {category.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Удалить"
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
  )
}
