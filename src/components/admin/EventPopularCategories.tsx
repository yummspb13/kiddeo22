'use client';

import { useState, useEffect } from 'react';

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
  city: City;
}

interface EventPopularCategory {
  id: number;
  isPermanent: boolean;
  daysToShow: number | null;
  startDate: string | null;
  endDate: string | null;
  popularCategory: PopularCategory;
}

interface EventPopularCategoriesProps {
  eventId: number;
  adminKey: string;
}

export default function EventPopularCategories({ eventId, adminKey }: EventPopularCategoriesProps) {
  const [popularCategories, setPopularCategories] = useState<PopularCategory[]>([]);
  const [eventCategories, setEventCategories] = useState<EventPopularCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventPopularCategory | null>(null);

  // Загружаем популярные категории
  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        const response = await fetch(`/api/admin/popular-categories?key=${adminKey}`);
        if (response.ok) {
          const data = await response.json();
          setPopularCategories(data);
        }
      } catch (error) {
        console.error('Error fetching popular categories:', error);
      }
    };

    fetchPopularCategories();
  }, [adminKey]);

  // Загружаем категории события
  useEffect(() => {
    const fetchEventCategories = async () => {
      try {
        const response = await fetch(`/api/admin/afisha-events/${eventId}/popular-categories?key=${adminKey}`);
        if (response.ok) {
          const data = await response.json();
          setEventCategories(data);
        }
      } catch (error) {
        console.error('Error fetching event categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventCategories();
  }, [eventId, adminKey]);

  // Управление видимостью полей временных настроек
  useEffect(() => {
    const handleCheckboxChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const temporarySettings = document.getElementById('temporary-settings');
      if (temporarySettings) {
        temporarySettings.style.display = target.checked ? 'none' : 'block';
      }
    };

    const checkboxes = document.querySelectorAll('input[name="isPermanent"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', handleCheckboxChange);
      // Инициализируем состояние при загрузке
      const target = checkbox as HTMLInputElement;
      const temporarySettings = document.getElementById('temporary-settings');
      if (temporarySettings) {
        temporarySettings.style.display = target.checked ? 'none' : 'block';
      }
    });

    return () => {
      checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('change', handleCheckboxChange);
      });
    };
  }, [showAddForm, editingCategory]);

  const handleAddCategory = async (formData: FormData) => {
    try {
      const popularCategoryId = parseInt(formData.get('popularCategoryId') as string);
      const isPermanent = formData.get('isPermanent') === 'on';
      const daysToShow = formData.get('daysToShow') ? parseInt(formData.get('daysToShow') as string) : null;
      const startDate = formData.get('startDate') as string;

      const response = await fetch(`/api/admin/afisha-events/${eventId}/popular-categories?key=${adminKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          popularCategoryId,
          isPermanent,
          daysToShow,
          startDate: startDate || new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setEventCategories(prev => [...prev, newCategory]);
        setShowAddForm(false);
        // Reset form
        (document.getElementById('add-category-form') as HTMLFormElement)?.reset();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Ошибка при добавлении категории');
    }
  };

  const handleUpdateCategory = async (categoryId: number, formData: FormData) => {
    try {
      const isPermanent = formData.get('isPermanent') === 'on';
      const daysToShow = formData.get('daysToShow') ? parseInt(formData.get('daysToShow') as string) : null;
      const startDate = formData.get('startDate') as string;
      const endDate = formData.get('endDate') as string;

      const response = await fetch(`/api/admin/afisha-events/${eventId}/popular-categories/${categoryId}?key=${adminKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPermanent,
          daysToShow,
          startDate: startDate || null,
          endDate: endDate || null
        }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setEventCategories(prev => 
          prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
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

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/afisha-events/${eventId}/popular-categories/${categoryId}?key=${adminKey}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEventCategories(prev => prev.filter(cat => cat.popularCategory.id !== categoryId));
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Популярные категории</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          + Добавить категорию
        </button>
      </div>

      {/* Форма добавления */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-3">Добавить к популярной категории</h4>
          <form id="add-category-form" action={handleAddCategory} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                name="popularCategoryId"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите категорию</option>
                {popularCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.city.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPermanent"
                id="isPermanent"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPermanent" className="ml-2 block text-sm text-gray-900">
                Показывать всегда
              </label>
            </div>

            <div id="temporary-settings" className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата начала
                </label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество дней для показа
                </label>
                <input
                  type="number"
                  name="daysToShow"
                  min="1"
                  max="365"
                  placeholder="Например: 10"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Оставьте пустым, если хотите указать конкретную дату окончания
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Добавить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список категорий */}
      <div className="space-y-2">
        {eventCategories.map((eventCategory) => (
          <div key={eventCategory.id} className="bg-white border rounded-lg p-4">
            {editingCategory?.id === eventCategory.id ? (
              <form action={(formData) => handleUpdateCategory(eventCategory.popularCategory.id, formData)} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {eventCategory.popularCategory.icon && (
                      <span className="text-lg">{eventCategory.popularCategory.icon}</span>
                    )}
                    <span className="font-medium">{eventCategory.popularCategory.name}</span>
                    <span className="text-sm text-gray-500">({eventCategory.popularCategory.city.name})</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPermanent"
                    defaultChecked={eventCategory.isPermanent}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Показывать всегда
                  </label>
                </div>

                <div id="temporary-settings" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата начала
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={eventCategory.startDate ? eventCategory.startDate.split('T')[0] : ''}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата окончания
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={eventCategory.endDate ? eventCategory.endDate.split('T')[0] : ''}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество дней для показа
                  </label>
                  <input
                    type="number"
                    name="daysToShow"
                    defaultValue={eventCategory.daysToShow || ''}
                    min="1"
                    max="365"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {eventCategory.popularCategory.icon && (
                      <span className="text-lg">{eventCategory.popularCategory.icon}</span>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{eventCategory.popularCategory.name}</span>
                        <span className="text-sm text-gray-500">({eventCategory.popularCategory.city.name})</span>
                        {eventCategory.isPermanent ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Постоянно
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Временно
                          </span>
                        )}
                        {!eventCategory.isPermanent && isExpired(eventCategory.endDate) && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Истекло
                          </span>
                        )}
                      </div>
                      {!eventCategory.isPermanent && (
                        <div className="text-sm text-gray-600 mt-1">
                          {eventCategory.startDate && (
                            <span>С: {formatDate(eventCategory.startDate)}</span>
                          )}
                          {eventCategory.endDate && (
                            <span className="ml-2">По: {formatDate(eventCategory.endDate)}</span>
                          )}
                          {eventCategory.daysToShow && (
                            <span className="ml-2">({eventCategory.daysToShow} дней)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCategory(eventCategory)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(eventCategory.popularCategory.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {eventCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Событие не добавлено ни к одной популярной категории</p>
        </div>
      )}
    </div>
  );
}