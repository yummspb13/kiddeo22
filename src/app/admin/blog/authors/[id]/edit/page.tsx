'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import ImageUpload from '@/components/admin/ImageUpload'

interface Author {
  id: number
  name: string
  email: string
  image?: string
  bio?: string
  heroImage?: string
  createdAt: string
  updatedAt: string
  postCount: number
}

interface FormData {
  name: string
  email: string
  image: string
  bio: string
  heroImage: string
}

export default function EditAuthorPage() {
  const [author, setAuthor] = useState<Author | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    image: '',
    bio: '',
    heroImage: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchAuthor()
    }
  }, [params.id])

  const fetchAuthor = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/blog/authors/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAuthor(data.author)
        setFormData({
          name: data.author.name || '',
          email: data.author.email || '',
          image: data.author.image || '',
          bio: data.author.bio || '',
          heroImage: data.author.heroImage || ''
        })
      } else {
        console.error('Failed to fetch author')
      }
    } catch (error) {
      console.error('Error fetching author:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/blog/authors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/blog/authors')
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при обновлении автора')
      }
    } catch (error) {
      console.error('Error updating author:', error)
      alert('Ошибка при обновлении автора')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Загрузка автора...</h1>
          <p className="text-gray-600">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Автор не найден</h1>
          <p className="text-gray-600 mb-6">Возможно, автор был удален</p>
          <button
            onClick={() => router.push('/admin/blog/authors')}
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
              <h1 className="text-3xl font-bold text-gray-900">Редактировать автора</h1>
              <p className="text-gray-600 mt-2">Редактирование: {author.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <div>Статей: {author.postCount}</div>
                <div>Создан: {new Date(author.createdAt).toLocaleDateString('ru-RU')}</div>
              </div>
              <button
                onClick={() => router.push('/admin/blog/authors')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Назад к списку
              </button>
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
                  Имя автора *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Введите имя автора"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="author@example.com"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Биография
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Краткая биография автора..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Изображения</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фото профиля
                </label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  placeholder="Выберите фото профиля"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero изображение
                </label>
                <ImageUpload
                  value={formData.heroImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, heroImage: url }))}
                  placeholder="Выберите hero изображение"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/blog/authors')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
