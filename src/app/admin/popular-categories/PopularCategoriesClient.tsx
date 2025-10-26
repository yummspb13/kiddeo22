'use client';

import { useState } from 'react';

interface City {
  id: number;
  name: string;
  slug: string;
}

interface PopularCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  cityId: number;
  city: City;
  createdAt: Date;
  updatedAt: Date;
}

interface PopularCategoriesClientProps {
  initialCities: City[];
  initialCategories: PopularCategory[];
}

export default function PopularCategoriesClient({ 
  initialCities, 
  initialCategories 
}: PopularCategoriesClientProps) {
  const [cities] = useState<City[]>(initialCities);
  const [categories, setCategories] = useState<PopularCategory[]>(initialCategories);
  const [selectedCity, setSelectedCity] = useState<number | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PopularCategory | null>(null);

  const filteredCategories = selectedCity === 'all' 
    ? categories 
    : categories.filter(cat => cat.cityId === selectedCity);

  const handleCreate = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/admin/popular-categories?key=kidsreview2025`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          icon: formData.get('icon'),
          color: formData.get('color'),
          cityId: formData.get('cityId'),
          sortOrder: formData.get('sortOrder') || 0,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        setIsCreating(false);
        // Reset form
        (document.getElementById('create-form') as HTMLFormElement)?.reset();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Ошибка при создании категории');
    }
  };

  const handleUpdate = async (id: number, formData: FormData) => {
    try {
      const response = await fetch(`/api/admin/popular-categories/${id}?key=kidsreview2025`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          icon: formData.get('icon'),
          color: formData.get('color'),
          cityId: formData.get('cityId'),
          sortOrder: formData.get('sortOrder'),
          isActive: formData.get('isActive') === 'on',
        }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(prev => 
          prev.map(cat => cat.id === id ? updatedCategory : cat)
        );
        setEditingCategory(null);
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Ошибка при обновлении категории');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/popular-categories/${id}?key=kidsreview2025`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  return (
    <div className="space-y-6 font-unbounded">
      {/* Фильтр по городу */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
          Фильтр по городу:
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Все города</option>
          {cities.map(city => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* Кнопка создания */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 font-unbounded">
          Категории ({filteredCategories.length})
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Добавить категорию
        </button>
      </div>

      {/* Форма создания */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Создать новую категорию</h3>
          <form id="create-form" action={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Например: Театральные представления"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Город *
                </label>
                <select
                  name="cityId"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Краткое описание категории"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Иконка
                </label>
                <input
                  type="text"
                  name="icon"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🎭"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цвет
                </label>
                <input
                  type="color"
                  name="color"
                  className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порядок сортировки
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={0}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список категорий */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCategories.map((category) => (
            <li key={category.id} className="px-6 py-4">
              {editingCategory?.id === category.id ? (
                <form action={(formData) => handleUpdate(category.id, formData)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название *
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={category.name}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Город *
                      </label>
                      <select
                        name="cityId"
                        defaultValue={category.cityId}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      name="description"
                      defaultValue={category.description || ''}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Иконка
                      </label>
                      <input
                        type="text"
                        name="icon"
                        defaultValue={category.icon || ''}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Цвет
                      </label>
                      <input
                        type="color"
                        name="color"
                        defaultValue={category.color || '#3B82F6'}
                        className="block w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Порядок сортировки
                      </label>
                      <input
                        type="number"
                        name="sortOrder"
                        defaultValue={category.sortOrder}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={category.isActive}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Активна
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Сохранить
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
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
                        <span>Город: {category.city.name}</span>
                        <span>Порядок: {category.sortOrder}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
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
              )}
            </li>
          ))}
        </ul>
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Категории не найдены</p>
        </div>
      )}
    </div>
  );
}
