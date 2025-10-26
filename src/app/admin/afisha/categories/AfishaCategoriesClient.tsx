'use client';

import { useState } from 'react';
import Image from 'next/image';
import CategoryIconUpload from '@/components/admin/CategoryIconUpload';

interface AfishaCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AfishaCategoriesClientProps {
  initialCategories: AfishaCategory[];
}

export default function AfishaCategoriesClient({ initialCategories }: AfishaCategoriesClientProps) {
  const [categories, setCategories] = useState<AfishaCategory[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AfishaCategory | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    coverImage: '',
    color: '#3B82F6',
    sortOrder: 0,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      coverImage: '',
      color: '#3B82F6',
      sortOrder: 0,
      isActive: true
    });
    setError(null);
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending create data:', formData);
      
      const response = await fetch('/api/admin/afisha/categories?key=kidsreview2025', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      setCategories([...categories, data.category]);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending update data:', formData);
      
      const response = await fetch(`/api/admin/afisha/categories/${editingCategory.id}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? data.category : cat
      ));
      setEditingCategory(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/afisha/categories/${id}?key=kidsreview2025`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = async (id: number) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    const currentIndex = categories.findIndex(cat => cat.id === id);
    if (currentIndex <= 0) return; // Уже наверху

    const newSortOrder = categories[currentIndex - 1].sortOrder;
    const oldSortOrder = category.sortOrder;

    setIsLoading(true);
    setError(null);

    try {
      // Обновляем текущую категорию
      const response1 = await fetch(`/api/admin/afisha/categories/${id}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          sortOrder: newSortOrder
        }),
      });

      if (!response1.ok) {
        throw new Error('Failed to update category order');
      }

      // Обновляем предыдущую категорию
      const prevCategory = categories[currentIndex - 1];
      const response2 = await fetch(`/api/admin/afisha/categories/${prevCategory.id}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...prevCategory,
          sortOrder: oldSortOrder
        }),
      });

      if (!response2.ok) {
        throw new Error('Failed to update category order');
      }

      // Обновляем локальное состояние
      const newCategories = [...categories];
      [newCategories[currentIndex], newCategories[currentIndex - 1]] = [newCategories[currentIndex - 1], newCategories[currentIndex]];
      setCategories(newCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveDown = async (id: number) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    const currentIndex = categories.findIndex(cat => cat.id === id);
    if (currentIndex >= categories.length - 1) return; // Уже внизу

    const newSortOrder = categories[currentIndex + 1].sortOrder;
    const oldSortOrder = category.sortOrder;

    setIsLoading(true);
    setError(null);

    try {
      // Обновляем текущую категорию
      const response1 = await fetch(`/api/admin/afisha/categories/${id}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          sortOrder: newSortOrder
        }),
      });

      if (!response1.ok) {
        throw new Error('Failed to update category order');
      }

      // Обновляем следующую категорию
      const nextCategory = categories[currentIndex + 1];
      const response2 = await fetch(`/api/admin/afisha/categories/${nextCategory.id}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...nextCategory,
          sortOrder: oldSortOrder
        }),
      });

      if (!response2.ok) {
        throw new Error('Failed to update category order');
      }

      // Обновляем локальное состояние
      const newCategories = [...categories];
      [newCategories[currentIndex], newCategories[currentIndex + 1]] = [newCategories[currentIndex + 1], newCategories[currentIndex]];
      setCategories(newCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category order');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (category: AfishaCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      coverImage: category.coverImage || '',
      color: category.color || '#3B82F6',
      sortOrder: category.sortOrder,
      isActive: category.isActive
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setShowCreateForm(false);
    resetForm();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'background');

      const response = await fetch('/api/admin/upload?key=kidsreview2025', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      // Обновляем coverImage в форме
      setFormData(prev => ({
        ...prev,
        coverImage: data.url
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Кнопка создания */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 font-unbounded">
          Категории ({categories.length})
        </h2>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingCategory(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Добавить категорию
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
          </h3>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Название категории"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="slug-kategorii"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Описание категории"
              />
            </div>

            <div>
              <CategoryIconUpload
                onUpload={(url) => setFormData({ ...formData, icon: url })}
                currentIcon={formData.icon}
                categoryName={formData.name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Обложка
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                {isUploading && (
                  <div className="text-sm text-blue-600">Загрузка...</div>
                )}
                <div className="text-sm text-gray-500">
                  Или введите URL:
                </div>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.coverImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.coverImage} 
                      alt="Предпросмотр обложки" 
                      className="w-32 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цвет
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Порядок сортировки
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Активна
              </label>
            </div>

          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={editingCategory ? handleUpdate : handleCreate}
              disabled={isLoading || !formData.name || !formData.slug}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Сохранение...' : (editingCategory ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </div>
      )}

      {/* Список категорий */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {category.coverImage ? (
                    <img 
                      src={category.coverImage} 
                      alt={category.name}
                      className="w-16 h-12 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {category.icon && (
                    <div className={`${category.coverImage ? 'hidden' : ''}`}>
                      {(category.icon.startsWith('http') || category.icon.startsWith('/uploads/')) ? (
                        <img
                          src={category.icon}
                          alt={category.name}
                          width={32}
                          height={32}
                          className="object-contain category-icon"
                          style={{ 
                            backgroundColor: 'transparent',
                            background: 'transparent',
                            mixBlendMode: 'normal'
                          }}
                        />
                      ) : (
                        <span className="text-2xl">
                          {category.icon}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {category.name}
                      </h3>
                      {category.color && (
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Slug: {category.slug}</span>
                      <div className="flex items-center space-x-2">
                        <span>Порядок: {category.sortOrder}</span>
                        <button
                          onClick={() => handleMoveUp(category.id)}
                          disabled={isLoading || categories.findIndex(cat => cat.id === category.id) === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Переместить вверх"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveDown(category.id)}
                          disabled={isLoading || categories.findIndex(cat => cat.id === category.id) === categories.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Переместить вниз"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Категории не найдены</p>
        </div>
      )}
    </div>
  );
}
