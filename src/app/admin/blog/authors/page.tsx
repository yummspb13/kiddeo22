'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  User, 
  Mail, 
  Calendar,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

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

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchAuthors()
  }, [])

  useEffect(() => {
    const filtered = authors.filter(author =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAuthors(filtered)
  }, [authors, searchTerm])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blog/authors')
      if (response.ok) {
        const data = await response.json()
        setAuthors(data.authors || [])
      } else {
        console.error('Failed to fetch authors')
      }
    } catch (error) {
      console.error('Error fetching authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого автора?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blog/authors/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAuthors(authors.filter(author => author.id !== id))
      } else {
        alert('Ошибка при удалении автора')
      }
    } catch (error) {
      console.error('Error deleting author:', error)
      alert('Ошибка при удалении автора')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Загрузка авторов...</h1>
          <p className="text-gray-600">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Авторы блога</h1>
              <p className="text-gray-600 mt-2">Управление авторами статей</p>
            </div>
            <button
              onClick={() => router.push('/admin/blog/authors/create')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Добавить автора
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Authors List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {filteredAuthors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Авторы не найдены' : 'Авторы не найдены'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Добавьте первого автора для начала работы'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/admin/blog/authors/create')}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Добавить автора
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Автор
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Контакты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статистика
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата создания
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAuthors.map((author) => (
                    <tr key={author.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {author.image ? (
                              <Image
                                src={author.image}
                                alt={author.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {author.name}
                            </div>
                            {author.bio && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {author.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {author.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          {author.postCount} статей
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(author.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/blog/author/${author.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Просмотр профиля"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/blog/authors/${author.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Редактировать"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(author.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего авторов</p>
                <p className="text-2xl font-semibold text-gray-900">{authors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего статей</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {authors.reduce((sum, author) => sum + author.postCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ImageIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">С фото профиля</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {authors.filter(author => author.image).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
