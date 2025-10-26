'use client'

import { useState } from 'react'
import { useAdminKey } from '@/hooks/useAdminKey'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Settings, Building, MapPin, Filter } from 'lucide-react'

type FilterScope = 'MAIN_VENUES' | 'VENUE_CATEGORY' | 'VENUE_SUBCATEGORY'

interface SectionVisibility {
  id: number
  scope: FilterScope
  cityId?: number
  categoryId?: number
  subcategoryId?: string
  isVisible: boolean
  hideIfEmpty: boolean
  customTitle?: string
  customDescription?: string
  venueCount: number
}

// Моковые данные
const mockSections: SectionVisibility[] = [
  {
    id: 1,
    scope: 'MAIN_VENUES',
    cityId: 1,
    isVisible: true,
    hideIfEmpty: false,
    venueCount: 150
  },
  {
    id: 2,
    scope: 'MAIN_VENUES',
    cityId: 2,
    isVisible: true,
    hideIfEmpty: false,
    venueCount: 89
  },
  {
    id: 3,
    scope: 'VENUE_CATEGORY',
    cityId: 1,
    categoryId: 1,
    isVisible: true,
    hideIfEmpty: true,
    customTitle: 'Мастер-классы для детей',
    venueCount: 23
  },
  {
    id: 4,
    scope: 'VENUE_CATEGORY',
    cityId: 1,
    categoryId: 2,
    isVisible: true,
    hideIfEmpty: true,
    customTitle: 'Развлечения и досуг',
    venueCount: 45
  },
  {
    id: 5,
    scope: 'VENUE_CATEGORY',
    cityId: 2,
    categoryId: 1,
    isVisible: false,
    hideIfEmpty: true,
    venueCount: 0
  },
  {
    id: 6,
    scope: 'VENUE_SUBCATEGORY',
    cityId: 1,
    categoryId: 2,
    subcategoryId: 'leisure',
    isVisible: true,
    hideIfEmpty: true,
    customTitle: 'Зоопарки и театры',
    customDescription: 'Места для семейного отдыха',
    venueCount: 12
  },
  {
    id: 7,
    scope: 'VENUE_SUBCATEGORY',
    cityId: 1,
    categoryId: 2,
    subcategoryId: 'aquapark',
    isVisible: false,
    hideIfEmpty: true,
    venueCount: 0
  }
]

const scopeLabels = {
  MAIN_VENUES: 'Основной раздел "Места"',
  VENUE_CATEGORY: 'Категории мест',
  VENUE_SUBCATEGORY: 'Подкатегории мест'
}

const categoryLabels = {
  1: 'Мастер-классы',
  2: 'Прочий досуг',
  3: 'Спорт',
  4: 'Образование',
  5: 'Медицина',
  6: 'Лагеря',
  7: 'Няни'
}

const subcategoryLabels = {
  leisure: 'Зоопарки, театры, аквапарки',
  aquapark: 'Аквапарки',
  zoo: 'Зоопарки',
  theater: 'Театры',
  farm: 'Фермы'
}

export default function VisibilityPage() {
  const { keySuffix } = useAdminKey()

  const [sections, setSections] = useState<SectionVisibility[]>(mockSections)
  const [selectedScope, setSelectedScope] = useState<FilterScope | 'ALL'>('ALL')
  const [selectedCity, setSelectedCity] = useState<number | 'ALL'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL')
  const [editingSection, setEditingSection] = useState<SectionVisibility | null>(null)

  const filteredSections = sections.filter(section => {
    if (selectedScope !== 'ALL' && section.scope !== selectedScope) return false
    if (selectedCity !== 'ALL' && section.cityId !== selectedCity) return false
    if (selectedCategory !== 'ALL' && section.categoryId !== selectedCategory) return false
    return true
  })

  const toggleVisibility = (id: number) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isVisible: !section.isVisible } : section
    ))
  }

  const toggleHideIfEmpty = (id: number) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, hideIfEmpty: !section.hideIfEmpty } : section
    ))
  }

  const editSection = (section: SectionVisibility) => {
    setEditingSection(section)
  }

  const saveSection = (updatedSection: SectionVisibility) => {
    setSections(sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    ))
    setEditingSection(null)
  }

  const cancelEdit = () => {
    setEditingSection(null)
  }

  const getSectionTitle = (section: SectionVisibility) => {
    if (section.customTitle) return section.customTitle
    
    if (section.scope === 'MAIN_VENUES') {
      return `Места ${section.cityId === 1 ? 'в Москве' : 'в СПб'}`
    }
    
    if (section.scope === 'VENUE_CATEGORY') {
      return `${categoryLabels[section.categoryId as keyof typeof categoryLabels] || 'Категория'} ${section.cityId === 1 ? 'в Москве' : 'в СПб'}`
    }
    
    if (section.scope === 'VENUE_SUBCATEGORY') {
      return subcategoryLabels[section.subcategoryId as keyof typeof subcategoryLabels] || section.subcategoryId || 'Подкатегория'
    }
    
    return 'Раздел'
  }

  const getSectionDescription = (section: SectionVisibility) => {
    if (section.customDescription) return section.customDescription
    
    if (section.scope === 'MAIN_VENUES') {
      return 'Все места для детей в городе'
    }
    
    if (section.scope === 'VENUE_CATEGORY') {
      return 'Места определенной категории'
    }
    
    if (section.scope === 'VENUE_SUBCATEGORY') {
      return 'Конкретные типы мест'
    }
    
    return ''
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
              <h1 className="text-3xl font-bold text-gray-900">Управление видимостью</h1>
              <p className="mt-2 text-gray-600">Настройка видимости разделов по городам и категориям</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
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
          </div>
        </div>

        {/* Sections List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Разделы ({filteredSections.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredSections.map((section) => (
              <div key={section.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {scopeLabels[section.scope]}
                      </span>
                      {section.cityId && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {section.cityId === 1 ? 'Москва' : 'СПб'}
                        </span>
                      )}
                      {section.categoryId && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                          {categoryLabels[section.categoryId as keyof typeof categoryLabels]}
                        </span>
                      )}
                      {section.subcategoryId && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                          {section.subcategoryId}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        section.venueCount > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {section.venueCount} мест
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {getSectionTitle(section)}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {getSectionDescription(section)}
                    </p>

                    {/* Settings */}
                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.isVisible}
                          onChange={() => toggleVisibility(section.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Показывать раздел</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.hideIfEmpty}
                          onChange={() => toggleHideIfEmpty(section.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Скрыть если нет мест</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(section.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        section.isVisible 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={section.isVisible ? 'Скрыть раздел' : 'Показать раздел'}
                    >
                      {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button 
                      onClick={() => editSection(section)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Настройки раздела"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Custom Title/Description */}
                {(section.customTitle || section.customDescription) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Кастомные настройки:</h4>
                    {section.customTitle && (
                      <p className="text-sm text-gray-600">
                        <strong>Заголовок:</strong> {section.customTitle}
                      </p>
                    )}
                    {section.customDescription && (
                      <p className="text-sm text-gray-600">
                        <strong>Описание:</strong> {section.customDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredSections.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Разделы не найдены</h3>
              <p className="text-gray-600">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Видимые разделы</h3>
                <p className="text-2xl font-bold text-green-600">
                  {sections.filter(s => s.isVisible).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <EyeOff className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Скрытые разделы</h3>
                <p className="text-2xl font-bold text-red-600">
                  {sections.filter(s => !s.isVisible).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Всего мест</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {sections.reduce((sum, s) => sum + s.venueCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Section Modal */}
        {editingSection && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Настройки раздела</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Кастомный заголовок
                  </label>
                  <input
                    type="text"
                    value={editingSection.customTitle || ''}
                    onChange={(e) => setEditingSection({...editingSection, customTitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Оставьте пустым для использования стандартного заголовка"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Кастомное описание
                  </label>
                  <textarea
                    value={editingSection.customDescription || ''}
                    onChange={(e) => setEditingSection({...editingSection, customDescription: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Оставьте пустым для использования стандартного описания"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingSection.isVisible}
                      onChange={(e) => setEditingSection({...editingSection, isVisible: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Показывать раздел</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingSection.hideIfEmpty}
                      onChange={(e) => setEditingSection({...editingSection, hideIfEmpty: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Скрыть если нет мест</span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Информация о разделе:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Тип:</strong> {scopeLabels[editingSection.scope]}</p>
                    {editingSection.cityId && (
                      <p><strong>Город:</strong> {editingSection.cityId === 1 ? 'Москва' : 'СПб'}</p>
                    )}
                    {editingSection.categoryId && (
                      <p><strong>Категория:</strong> {categoryLabels[editingSection.categoryId as keyof typeof categoryLabels]}</p>
                    )}
                    {editingSection.subcategoryId && (
                      <p><strong>Подкатегория:</strong> {editingSection.subcategoryId}</p>
                    )}
                    <p><strong>Количество мест:</strong> {editingSection.venueCount}</p>
                  </div>
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
                  onClick={() => saveSection(editingSection)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
