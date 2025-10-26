'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  id: number
  title: string
  slug: string
  status: string
  category?: {
    name: string
  }
  author: {
    name: string
    image?: string
  }
  publishedAt?: string
  createdAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  featuredImage?: string
}

export default function AdminArticlesPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog/posts')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту статью?')) return

    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Опубликовано'
      case 'DRAFT':
        return 'Черновик'
      case 'PENDING':
        return 'На модерации'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Статьи блога</h1>
            <p className="text-gray-600 mt-2">Управление статьями и контентом</p>
          </div>
          <Link
            href="/admin/blog/create"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Создать статью
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                <option value="PUBLISHED">Опубликовано</option>
                <option value="DRAFT">Черновик</option>
                <option value="PENDING">На модерации</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка статей...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Статей пока нет</h3>
              <p className="text-gray-600 mb-6">Создайте первую статью для блога</p>
              <Link
                href="/admin/blog/create"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Создать статью
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статья
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Автор
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статистика
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPosts.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          {post.featuredImage ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                              <Image
                                src={post.featuredImage}
                                alt={post.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-2xl">📝</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {post.category?.name || 'Без категории'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                            {post.author.image ? (
                              <Image
                                src={post.author.image}
                                alt={post.author.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {post.author.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-900">{post.author.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {getStatusText(post.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <span>👁️</span>
                            <span>{post.viewCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>❤️</span>
                            <span>{post.likeCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{post.commentCount}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.publishedAt ? (
                          <div>
                            <div>Опубликовано</div>
                            <div className="text-xs text-gray-500">
                              {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div>Создано</div>
                            <div className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Просмотр
                          </Link>
                          <Link
                            href={`/admin/blog/articles/${post.id}/edit`}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Редактировать
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

