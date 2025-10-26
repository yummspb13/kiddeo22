'use client'

import { useState, useEffect } from 'react'
import { Edit } from 'lucide-react'
import { VenueParameter } from '@prisma/client'
import Link from 'next/link'

interface VenueSubcategory {
  id: number
  name: string
  category: {
    name: string
  }
  parameters?: VenueParameter[]
}

export function VenueParametersClient() {
  const [subcategories, setSubcategories] = useState<VenueSubcategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubcategories()
  }, [])

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/admin/venues/subcategories')
      if (response.ok) {
        const data = await response.json()
        setSubcategories(data)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    } finally {
      setLoading(false)
    }
  }

  const getParameterCountByTariff = (parameters: VenueParameter[] | undefined, tariff: 'free' | 'optimal' | 'maximum') => {
    if (!parameters || !Array.isArray(parameters)) {
      return 0
    }
    return parameters.filter(p => {
      switch (tariff) {
        case 'free': return p.isFree
        case 'optimal': return p.isOptimal
        case 'maximum': return p.isMaximum
        default: return false
      }
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Параметры подкатегорий</h1>
          <p className="text-gray-600">Эти параметры служат как основа для заполнения информации партнерами для описания своего места или услуги</p>
        </div>
      </div>

      {/* Таблица параметров подкатегорий */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Подкатегория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Бесплатный
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Оптимальный
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Максимальный
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Редактировать
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subcategories.map((subcategory) => (
                <tr key={subcategory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                      <div className="text-sm text-gray-500">{subcategory.category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getParameterCountByTariff(subcategory.parameters, 'free') > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getParameterCountByTariff(subcategory.parameters, 'free')} параметров
                        </span>
                      ) : (
                        <span className="text-gray-400">Пусто</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getParameterCountByTariff(subcategory.parameters, 'optimal') > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getParameterCountByTariff(subcategory.parameters, 'optimal')} параметров
                        </span>
                      ) : (
                        <span className="text-gray-400">Пусто</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getParameterCountByTariff(subcategory.parameters, 'maximum') > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getParameterCountByTariff(subcategory.parameters, 'maximum')} параметров
                        </span>
                      ) : (
                        <span className="text-gray-400">Пусто</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/venues/parameters/${subcategory.id}?key=kidsreview2025`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </Link>
                  </td>
                </tr>
              ))}
              {subcategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Подкатегории не найдены. Создайте подкатегорию в разделе "Подкатегории".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}