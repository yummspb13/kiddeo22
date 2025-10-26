'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Star } from 'lucide-react'

interface Collection {
  id: string
  title: string
  slug: string
  description?: string
  coverImage?: string
  isActive: boolean
  hideFromAfisha: boolean
  showInVenues: boolean
  showInMain: boolean
  showInBlog: boolean
  order: number
  city: string
  citySlug?: string
  createdAt: string
  updatedAt: string
  _count: {
    eventCollections: number
    venueCollections: number
  }
}

export default function CollectionsAdminPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCollections()
  }, [])

  // Обновляем данные при возврате на страницу
  useEffect(() => {
    const handleFocus = () => {
      loadCollections()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/collections?key=kidsreview2025')
      if (!response.ok) {
        throw new Error('Failed to load collections')
      }
      const data = await response.json()
      setCollections(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту подборку?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/collections/${id}?key=kidsreview2025`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete collection')
      }
      
      await loadCollections()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/collections/${id}?key=kidsreview2025`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update collection')
      }
      
      await loadCollections()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка подборок...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление подборками</h1>
              <p className="text-gray-600 mt-2">Создавайте и управляйте подборками событий и мест</p>
            </div>
            <Link
              href="/admin/collections/create?key=kidsreview2025"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Создать подборку
            </Link>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Analytics Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Collections */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего подборок</p>
                <p className="text-2xl font-bold text-gray-900">{collections.length}</p>
              </div>
            </div>
          </div>

          {/* Active Collections */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Активных</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collections.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего событий</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collections.reduce((sum, c) => sum + c._count.eventCollections, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Venues */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего мест</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collections.reduce((sum, c) => sum + c._count.venueCollections, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Analytics */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Размещение подборок</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {collections.filter(c => !c.hideFromAfisha).length}
              </div>
              <div className="text-sm text-gray-500">В Афише</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {collections.filter(c => c.showInVenues).length}
              </div>
              <div className="text-sm text-gray-500">В Местах</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {collections.filter(c => c.showInMain).length}
              </div>
              <div className="text-sm text-gray-500">На Главной</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {collections.filter(c => c.showInBlog).length}
              </div>
              <div className="text-sm text-gray-500">В Блоге</div>
            </div>
          </div>
        </div>

        {/* Collections table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Подборка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Город
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    События
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Места
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Всего
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размещение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Создана
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {collection.coverImage ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={collection.coverImage}
                              alt={collection.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <Star className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {collection.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {collection.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {collection.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {collection._count.eventCollections}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {collection._count.venueCollections}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-semibold text-lg">
                          {collection._count.eventCollections + collection._count.venueCollections}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {!collection.hideFromAfisha && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Афиша
                          </span>
                        )}
                        {collection.showInVenues && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Места
                          </span>
                        )}
                        {collection.showInMain && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Главная
                          </span>
                        )}
                        {collection.showInBlog && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Блог
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(collection.id, collection.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          collection.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {collection.isActive ? 'Активна' : 'Неактивна'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(collection.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/collections/${collection.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/collections/${collection.id}/edit?key=kidsreview2025`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(collection.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {collections.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Подборок пока нет
            </h3>
            <p className="text-gray-600 mb-6">
              Создайте первую подборку событий и мест для ваших пользователей
            </p>
            <Link
              href="/admin/collections/create?key=kidsreview2025"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Создать подборку
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
