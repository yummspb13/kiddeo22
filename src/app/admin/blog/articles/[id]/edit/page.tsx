'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import ImageUpload from '@/components/admin/ImageUpload'
import RichTextEditor from '@/components/RichTextEditor'

interface Category {
  id: number
  name: string
  slug: string
}

interface City {
  id: number
  name: string
  slug: string
}

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  status: string
  priority: string
  category?: {
    id: number
    name: string
    slug: string
  }
  author: {
    id: number
    name: string
    image?: string
  }
  city?: {
    id: number
    name: string
    slug: string
  }
  publishedAt?: string
  createdAt: string
  updatedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [post, setPost] = useState<BlogPost | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    categoryId: '',
    cityId: '',
    status: 'DRAFT',
    priority: 'NORMAL',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  })

  useEffect(() => {
    if (params?.id) {
      fetchPost()
      fetchCategories()
      fetchCities()
    }
  }, [params?.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${params?.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setPost(data.post)
        
        // Парсим контент если это JSON строка
        let parsedContent = data.post.content || ''
        if (typeof parsedContent === 'string' && parsedContent.trim().startsWith('{')) {
          try {
            parsedContent = JSON.parse(parsedContent)
          } catch (e) {
            console.warn('Failed to parse content as JSON:', e)
            // Если не удалось распарсить, оставляем как есть
          }
        }
        
        setFormData({
          title: data.post.title,
          slug: data.post.slug,
          excerpt: data.post.excerpt || '',
          content: parsedContent,
          featuredImage: data.post.featuredImage || '',
          categoryId: data.post.category?.id?.toString() || '',
          cityId: data.post.city?.id?.toString() || '',
          status: data.post.status,
          priority: data.post.priority,
          seoTitle: data.post.seoTitle || '',
          seoDescription: data.post.seoDescription || '',
          seoKeywords: data.post.seoKeywords || ''
        })
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities')
      const data = await response.json()
      if (response.ok) {
        // API возвращает массив напрямую, а не объект с полем cities
        setCities(Array.isArray(data) ? data : data.cities || [])
      } else {
        console.error('Error fetching cities:', data.error)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-я\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/blog/posts/${params?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          cityId: formData.cityId ? parseInt(formData.cityId) : null
        }),
      })

      if (response.ok) {
        router.push('/admin/blog/articles')
      } else {
        const error = await response.json()
        alert(`Ошибка: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Ошибка при обновлении статьи')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Статья не найдена</h1>
          <p className="text-gray-600 mb-6">Возможно, статья была удалена</p>
          <button
            onClick={() => router.push('/admin/blog/articles')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Редактировать статью</h1>
              <p className="text-gray-600 mt-2">Редактирование: {post.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <div>Просмотров: {post.viewCount}</div>
                <div>Лайков: {post.likeCount}</div>
                <div>Комментариев: {post.commentCount}</div>
              </div>
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Просмотр
              </a>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Основная информация</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Введите заголовок статьи"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL (slug) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="url-stati"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
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
                  value={formData.cityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, cityId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Все города</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Краткое описание
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Краткое описание статьи для превью"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Обложка
              </label>
              <ImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                placeholder="Выберите обложку статьи"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Содержание</h2>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Начните писать статью..."
            />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO настройки</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO заголовок
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="SEO заголовок для поисковых систем"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO описание
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Описание для поисковых систем"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO ключевые слова
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="ключевые, слова, через, запятую"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Публикация</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="DRAFT">Черновик</option>
                  <option value="PENDING">На модерации</option>
                  <option value="PUBLISHED">Опубликовано</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="LOW">Низкий</option>
                  <option value="NORMAL">Обычный</option>
                  <option value="HIGH">Высокий</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/blog/articles')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={saving}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}

