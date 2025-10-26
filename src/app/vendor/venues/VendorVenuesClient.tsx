"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  MoreVertical,
  BarChart3
} from 'lucide-react'
import '@/styles/profile.css'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

interface VenuePartner {
  id: number
  name: string
  slug: string
  address?: string
  heroImage?: string
  coverImage?: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED'
  createdAt: string
  subcategory: {
    name: string
    slug: string
    type: 'PLACE' | 'SERVICE'
  }
  city: {
    name: string
  }
}

interface Subcategory {
  id: number
  name: string
  slug: string
  type: 'PLACE' | 'SERVICE'
  category: {
    name: string
  }
}

interface Vendor {
  id: number
  displayName: string
  venuePartners: VenuePartner[]
}

interface VendorVenuesClientProps {
  vendor: Vendor
  subcategories: Subcategory[]
}

export default function VendorVenuesClient({ vendor, subcategories }: VendorVenuesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [deletingVenueId, setDeletingVenueId] = useState<number | null>(null)
  const [venues, setVenues] = useState(vendor.venuePartners)

  // Фильтрация мест
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || venue.status === statusFilter
    const matchesType = typeFilter === 'all' || venue.subcategory.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          text: 'Активно',
          color: 'bg-green-100 text-green-800',
          icon: '🟢'
        }
      case 'PENDING':
        return {
          text: 'На модерации',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '🟡'
        }
      case 'REJECTED':
        return {
          text: 'Отклонено',
          color: 'bg-red-100 text-red-800',
          icon: '🔴'
        }
      case 'INACTIVE':
        return {
          text: 'Неактивно',
          color: 'bg-gray-100 text-gray-800',
          icon: '⚫'
        }
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800',
          icon: '❓'
        }
    }
  }

  const handleDeleteVenue = async (venueId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это место?')) {
      return
    }

    setDeletingVenueId(venueId)
    
    try {
      const response = await fetch(`/api/vendor/venues/${venueId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Ошибка при удалении места')
      }

      // Удаляем место из локального состояния
      setVenues(prev => prev.filter(venue => venue.id !== venueId))
    } catch (error) {
      console.error('Error deleting venue:', error)
      alert('Ошибка при удалении места')
    } finally {
      setDeletingVenueId(null)
    }
  }

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'PLACE':
        return {
          text: 'Место',
          color: 'bg-blue-100 text-blue-800',
          icon: '🏢'
        }
      case 'SERVICE':
        return {
          text: 'Услуга',
          color: 'bg-purple-100 text-purple-800',
          icon: '⚙️'
        }
      default:
        return {
          text: type,
          color: 'bg-gray-100 text-gray-800',
          icon: '❓'
        }
    }
  }

  const stats = {
    total: vendor.venuePartners.length,
    active: vendor.venuePartners.filter(v => v.status === 'ACTIVE').length,
    pending: vendor.venuePartners.filter(v => v.status === 'PENDING').length,
    rejected: vendor.venuePartners.filter(v => v.status === 'REJECTED').length
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${unbounded.variable}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-unbounded-bold text-gray-900 mb-2">
                Мои места
              </h1>
              <p className="text-lg text-gray-600 font-unbounded-regular">
                Управляйте своими местами и услугами
              </p>
            </div>
            <Link 
              href="/vendor/venues/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-unbounded-medium inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Добавить место</span>
            </Link>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card blue">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-unbounded-bold text-gray-900">{stats.total}</span>
            </div>
            <div className="text-sm text-gray-600 font-unbounded-regular">Всего мест</div>
          </div>

          <div className="stat-card green">
            <div className="flex items-center justify-between mb-2">
              <div className="w-5 h-5 bg-green-600 rounded-full"></div>
              <span className="text-2xl font-unbounded-bold text-gray-900">{stats.active}</span>
            </div>
            <div className="text-sm text-gray-600 font-unbounded-regular">Активных</div>
          </div>

          <div className="stat-card yellow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-5 h-5 bg-yellow-600 rounded-full"></div>
              <span className="text-2xl font-unbounded-bold text-gray-900">{stats.pending}</span>
            </div>
            <div className="text-sm text-gray-600 font-unbounded-regular">На модерации</div>
          </div>

          <div className="stat-card red">
            <div className="flex items-center justify-between mb-2">
              <div className="w-5 h-5 bg-red-600 rounded-full"></div>
              <span className="text-2xl font-unbounded-bold text-gray-900">{stats.rejected}</span>
            </div>
            <div className="text-sm text-gray-600 font-unbounded-regular">Отклонено</div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Поиск */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск по названию, адресу или категории..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded-regular"
              />
            </div>

            {/* Фильтры */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-unbounded-medium"
              >
                <Filter className="w-4 h-4" />
                <span>Фильтры</span>
              </button>
            </div>
          </div>

          {/* Расширенные фильтры */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все статусы</option>
                    <option value="ACTIVE">Активно</option>
                    <option value="PENDING">На модерации</option>
                    <option value="REJECTED">Отклонено</option>
                    <option value="INACTIVE">Неактивно</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Все типы</option>
                    <option value="PLACE">Места</option>
                    <option value="SERVICE">Услуги</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Список мест */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredVenues.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-unbounded-semibold text-gray-900 mb-2">
                {vendor.venuePartners.length === 0 ? 'У вас пока нет мест' : 'Места не найдены'}
              </h3>
              <p className="text-gray-600 font-unbounded-regular mb-6">
                {vendor.venuePartners.length === 0 
                  ? 'Добавьте свои места, чтобы создавать карточки и привлекать клиентов'
                  : 'Попробуйте изменить фильтры или поисковый запрос'
                }
              </p>
              {vendor.venuePartners.length === 0 && (
                <Link 
                  href="/vendor/venues/create"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-unbounded-medium"
                >
                  Добавить первое место
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredVenues.map((venue) => {
                const statusInfo = getStatusInfo(venue.status)
                const typeInfo = getTypeInfo(venue.subcategory.type)
                
                return (
                  <div key={venue.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Изображение */}
                      <div className="flex-shrink-0">
                        {venue.heroImage ? (
                          <img 
                            src={venue.heroImage} 
                            alt={venue.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Информация */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-unbounded-semibold text-gray-900 mb-1">
                              {venue.name}
                            </h3>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {venue.city.name}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(venue.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                            </div>

                            {venue.address && (
                              <p className="text-sm text-gray-500 mb-2">{venue.address}</p>
                            )}

                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                <span className="mr-1">{statusInfo.icon}</span>
                                {statusInfo.text}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                <span className="mr-1">{typeInfo.icon}</span>
                                {typeInfo.text}
                              </span>
                              <span className="text-xs text-gray-500">
                                {venue.subcategory.name}
                              </span>
                            </div>
                          </div>

                          {/* Действия */}
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/venue/${venue.slug}`}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Просмотр"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/vendor/venues/${venue.id}`}
                              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Дешборд"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/vendor/venues/${venue.id}/edit`}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Редактировать"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteVenue(venue.id)}
                              disabled={deletingVenueId === venue.id}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Еще"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
