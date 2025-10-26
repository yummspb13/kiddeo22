'use client';

import { useState, useEffect } from 'react';

interface PopularCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  city: string;
  isActive: boolean;
  sortOrder: number;
}

interface EventPopularCategory {
  id: number;
  eventName: string;
  popularCategory: PopularCategory;
  isPermanent: boolean;
  daysToShow?: number;
  startDate?: string;
  endDate?: string;
}

export default function DemoPopularCategoriesPage() {
  const [popularCategories] = useState<PopularCategory[]>([
    {
      id: 1,
      name: 'Театральные представления',
      description: 'Спектакли, мюзиклы, детские постановки',
      icon: '🎭',
      color: '#8B5CF6',
      city: 'Москва',
      isActive: true,
      sortOrder: 1
    },
    {
      id: 2,
      name: 'События нашего города',
      description: 'Местные мероприятия и активности',
      icon: '🏛️',
      color: '#3B82F6',
      city: 'Москва',
      isActive: true,
      sortOrder: 2
    },
    {
      id: 3,
      name: 'Спортивные мероприятия',
      description: 'Спорт, фитнес, активный отдых',
      icon: '⚽',
      color: '#10B981',
      city: 'Москва',
      isActive: true,
      sortOrder: 3
    }
  ]);

  const [eventCategories, setEventCategories] = useState<EventPopularCategory[]>([
    {
      id: 1,
      eventName: 'Спектакль "Золушка"',
      popularCategory: popularCategories[0],
      isPermanent: false,
      daysToShow: 10,
      startDate: '2025-09-14',
      endDate: '2025-09-24'
    },
    {
      id: 2,
      eventName: 'Фестиваль детского творчества',
      popularCategory: popularCategories[1],
      isPermanent: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventPopularCategory | null>(null);

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

  const handleAddCategory = (formData: FormData) => {
    const popularCategoryId = parseInt(formData.get('popularCategoryId') as string);
    const eventName = formData.get('eventName') as string;
    const isPermanent = formData.get('isPermanent') === 'on';
    const daysToShow = formData.get('daysToShow') ? parseInt(formData.get('daysToShow') as string) : undefined;
    const startDate = formData.get('startDate') as string;

    const selectedCategory = popularCategories.find(cat => cat.id === popularCategoryId);
    if (!selectedCategory) return;

    const newEventCategory: EventPopularCategory = {
      id: Date.now(),
      eventName,
      popularCategory: selectedCategory,
      isPermanent,
      daysToShow,
      startDate,
      endDate: isPermanent ? undefined : (daysToShow ? 
        new Date(new Date(startDate).getTime() + daysToShow * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        undefined
      )
    };

    setEventCategories(prev => [...prev, newEventCategory]);
    setShowAddForm(false);
    (document.getElementById('add-category-form') as HTMLFormElement)?.reset();
  };

  const handleUpdateCategory = (id: number, formData: FormData) => {
    const isPermanent = formData.get('isPermanent') === 'on';
    const daysToShow = formData.get('daysToShow') ? parseInt(formData.get('daysToShow') as string) : undefined;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    setEventCategories(prev => 
      prev.map(cat => 
        cat.id === id 
          ? {
              ...cat,
              isPermanent,
              daysToShow,
              startDate,
              endDate: isPermanent ? undefined : (endDate || (daysToShow ? 
                new Date(new Date(startDate).getTime() + daysToShow * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                undefined
              ))
            }
          : cat
      )
    );
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      setEventCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const isExpired = (endDate: string | undefined) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Демо: Популярные категории</h1>
          <p className="mt-2 text-gray-600">
            Система управления популярными категориями для событий с настройкой времени показа
          </p>
        </div>

        <div className="space-y-6">
          {/* Доступные популярные категории */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Доступные популярные категории</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {popularCategories.map(category => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{category.city}</span>
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Управление связями событий с категориями */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">События в популярных категориях</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Добавить событие к категории
              </button>
            </div>

            {/* Форма добавления */}
            {showAddForm && (
              <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Добавить событие к популярной категории</h3>
                <form id="add-category-form" action={handleAddCategory} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название события *
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Например: Спектакль 'Золушка'"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Популярная категория *
                    </label>
                    <select
                      name="popularCategoryId"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Выберите категорию</option>
                      {popularCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.city})
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
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Добавить
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Список событий */}
            <div className="space-y-2">
              {eventCategories.map((eventCategory) => (
                <div key={eventCategory.id} className="border rounded-lg p-4">
                  {editingCategory?.id === eventCategory.id ? (
                    <form action={(formData) => handleUpdateCategory(eventCategory.id, formData)} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{eventCategory.popularCategory.icon}</span>
                          <span className="font-medium">{eventCategory.eventName}</span>
                          <span className="text-sm text-gray-500">({eventCategory.popularCategory.name})</span>
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
                            defaultValue={eventCategory.startDate || ''}
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
                            defaultValue={eventCategory.endDate || ''}
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
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{eventCategory.popularCategory.icon}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{eventCategory.eventName}</span>
                              <span className="text-sm text-gray-500">({eventCategory.popularCategory.name})</span>
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
                          onClick={() => handleDeleteCategory(eventCategory.id)}
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
                <p>События не добавлены ни к одной популярной категории</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}