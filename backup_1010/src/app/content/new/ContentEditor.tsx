"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Save, 
  Eye, 
  Send, 
  Calendar, 
  Tag, 
  Image, 
  Link, 
  Settings,
  ArrowLeft,
  FileText,
  Users,
  BarChart3,
  MapPin,
  Layout
} from "lucide-react"

interface User {
  id?: number
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ContentEditorProps {
  user: User
}

interface ContentForm {
  title: string
  type: string
  categoryId: string
  cityId: string
  excerpt: string
  content: string
  featuredImage: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  tags: string[]
  priority: string
  scheduledAt: string
  status: string
}

export default function ContentEditor({ user }: ContentEditorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentType = searchParams.get('type') || 'ARTICLE'
  
  const [form, setForm] = useState<ContentForm>({
    title: '',
    type: contentType,
    categoryId: '',
    cityId: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    tags: [],
    priority: 'NORMAL',
    scheduledAt: '',
    status: 'DRAFT'
  })
  
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [cities, setCities] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Заглушка для демонстрации
    setCategories([
      { id: '1', name: 'События' },
      { id: '2', name: 'Образование' },
      { id: '3', name: 'Спорт' },
      { id: '4', name: 'Творчество' },
      { id: '5', name: 'Развлечения' }
    ])
    
    setCities([
      { id: '1', name: 'Москва' },
      { id: '2', name: 'Санкт-Петербург' },
      { id: '3', name: 'Екатеринбург' },
      { id: '4', name: 'Новосибирск' }
    ])
  }, [])

  const handleInputChange = (field: keyof ContentForm, value: string | string[]) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = (tag: string) => {
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSave = async (status: string) => {
    setSaving(true)
    try {
      // Здесь будет API вызов для сохранения контента
      console.log('Saving content:', { ...form, status })
      
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Перенаправление на страницу контента
      router.push('/content')
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setSaving(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ARTICLE':
        return <FileText className="w-5 h-5" />
      case 'COLLECTION':
        return <Users className="w-5 h-5" />
      case 'SPECIAL_PROJECT':
        return <BarChart3 className="w-5 h-5" />
      case 'HERO_CITY':
        return <MapPin className="w-5 h-5" />
      case 'LAYOUT':
        return <Layout className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ARTICLE':
        return 'Статья'
      case 'COLLECTION':
        return 'Подборка'
      case 'SPECIAL_PROJECT':
        return 'Спецпроект'
      case 'HERO_CITY':
        return 'Хиро в городе'
      case 'LAYOUT':
        return 'Лайаут'
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Создание контента</h1>
                <p className="text-gray-600 mt-1">
                  {getTypeLabel(form.type)} • {user.name || 'Пользователь'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Сохранение...' : 'Сохранить черновик'}</span>
              </button>
              <button
                onClick={() => handleSave('PENDING_REVIEW')}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Отправить на модерацию</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заголовок *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите заголовок контента"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Краткое описание
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Краткое описание контента для превью"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Основной контент *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={12}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите основной контент (поддерживается Markdown)"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO настройки</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO заголовок
                  </label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Заголовок для поисковых систем"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO описание
                  </label>
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Описание для поисковых систем"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO ключевые слова
                  </label>
                  <input
                    type="text"
                    value={form.seoKeywords}
                    onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ключевые слова через запятую"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Content Type */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Тип контента</h3>
              <div className="space-y-3">
                {[
                  { value: 'ARTICLE', label: 'Статья', icon: <FileText className="w-4 h-4" /> },
                  { value: 'COLLECTION', label: 'Подборка', icon: <Users className="w-4 h-4" /> },
                  { value: 'SPECIAL_PROJECT', label: 'Спецпроект', icon: <BarChart3 className="w-4 h-4" /> },
                  { value: 'HERO_CITY', label: 'Хиро в городе', icon: <MapPin className="w-4 h-4" /> },
                  { value: 'LAYOUT', label: 'Лайаут', icon: <Layout className="w-4 h-4" /> }
                ].map((type) => (
                  <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={form.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      {type.icon}
                      <span className="text-sm font-medium text-gray-700">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Category & City */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Классификация</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Город
                  </label>
                  <select
                    value={form.cityId}
                    onChange={(e) => handleInputChange('cityId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Выберите город</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Теги</h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Добавить тег"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      handleAddTag(input.value)
                      input.value = ''
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Publishing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Публикация</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Приоритет
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LOW">Низкий</option>
                    <option value="NORMAL">Обычный</option>
                    <option value="HIGH">Высокий</option>
                    <option value="URGENT">Срочный</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Запланированная публикация
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
