// src/components/chat/ChatTemplates.tsx
"use client"

import { useState } from "react"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Star,
  MessageSquare,
  Tag,
  Search
} from "lucide-react"

interface Template {
  id: number
  name: string
  content: string
  category: string
  isActive: boolean
  usageCount: number
  createdAt: Date
}

interface ChatTemplatesProps {
  templates: Template[]
  onCreateTemplate: (template: Omit<Template, 'id' | 'usageCount' | 'createdAt'>) => void
  onUpdateTemplate: (id: number, template: Partial<Template>) => void
  onDeleteTemplate: (id: number) => void
  onUseTemplate: (id: number) => void
}

const CATEGORIES = [
  'greeting',
  'booking',
  'support',
  'pricing',
  'availability',
  'cancellation',
  'follow_up',
  'thank_you'
]

const CATEGORY_LABELS = {
  greeting: 'Приветствие',
  booking: 'Бронирование',
  support: 'Поддержка',
  pricing: 'Цены',
  availability: 'Доступность',
  cancellation: 'Отмена',
  follow_up: 'Дополнительно',
  thank_you: 'Благодарность'
}

export default function ChatTemplates({
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onUseTemplate
}: ChatTemplatesProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'greeting',
    isActive: true
  })

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  const handleCreateTemplate = () => {
    onCreateTemplate(formData)
    setShowCreateModal(false)
    setFormData({
      name: '',
      content: '',
      category: 'greeting',
      isActive: true
    })
  }

  const handleUpdateTemplate = () => {
    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, formData)
      setEditingTemplate(null)
      setFormData({
        name: '',
        content: '',
        category: 'greeting',
        isActive: true
      })
    }
  }

  const openEditModal = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
      isActive: template.isActive
    })
  }

  const handleCopyTemplate = (template: Template) => {
    setFormData({
      name: `${template.name} (копия)`,
      content: template.content,
      category: template.category,
      isActive: true
    })
    setShowCreateModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Шаблоны ответов</h2>
          <p className="text-gray-600">Управляйте быстрыми ответами для чата</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Создать шаблон
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по шаблонам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Все категории</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
            </option>
          ))}
        </select>
      </div>

      {/* Список шаблонов по категориям */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category} className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({categoryTemplates.length})
                </span>
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {categoryTemplates.map((template) => (
                <div key={template.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        {template.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Активен
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Неактивен
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{template.content}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span>Использован {template.usageCount} раз</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          <span>Создан {new Date(template.createdAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onUseTemplate(template.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                        title="Использовать"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyTemplate(template)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-md"
                        title="Копировать"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно создания/редактирования */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTemplate ? 'Редактировать шаблон' : 'Создать шаблон'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название шаблона
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Приветствие для новых клиентов"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Текст шаблона
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите текст шаблона..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Используйте переменные: {['{имя_клиента}', '{название_услуги}', '{дата}'].join(', ')}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Активен
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingTemplate(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingTemplate ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
