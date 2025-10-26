// src/components/vendor/ContentManager.tsx
"use client"

import { useState } from "react"
import { Plus, Edit, Eye, Trash2, Calendar, MapPin, Users, DollarSign } from "lucide-react"

interface Listing {
  id: number
  title: string
  type: 'EVENT' | 'VENUE' | 'SERVICE'
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'
  createdAt: Date
  updatedAt: Date
  eventDate?: Date
  address?: string
  priceFrom?: number
  priceTo?: number
  views?: number
  bookings?: number
}

interface ContentManagerProps {
  listings: Listing[]
  onCreate: () => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onView: (id: number) => void
}

const TYPE_LABELS = {
  EVENT: 'Событие',
  VENUE: 'Место',
  SERVICE: 'Услуга'
}

const STATUS_LABELS = {
  DRAFT: 'Черновик',
  PENDING: 'На модерации',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
  NEEDS_REVISION: 'Требует правок'
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  NEEDS_REVISION: 'bg-orange-100 text-orange-800'
}

export default function ContentManager({ 
  listings, 
  onCreate, 
  onEdit, 
  onDelete, 
  onView 
}: ContentManagerProps) {
  const [filter, setFilter] = useState<'ALL' | 'EVENT' | 'VENUE' | 'SERVICE'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'>('ALL')

  const filteredListings = listings.filter(listing => {
    const typeMatch = filter === 'ALL' || listing.type === filter
    const statusMatch = statusFilter === 'ALL' || listing.status === statusFilter
    return typeMatch && statusMatch
  })

  const formatPrice = (priceFrom?: number, priceTo?: number) => {
    if (!priceFrom && !priceTo) return 'Цена не указана'
    if (priceFrom && priceTo) return `${priceFrom} - ${priceTo} ₽`
    if (priceFrom) return `от ${priceFrom} ₽`
    if (priceTo) return `до ${priceTo} ₽`
    return 'Цена не указана'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Мои объявления</h2>
          <p className="text-gray-600">Управляйте своими событиями, местами и услугами</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Создать объявление
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4">
        {/* Фильтр по типу */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Все типы</option>
            <option value="EVENT">События</option>
            <option value="VENUE">Места</option>
            <option value="SERVICE">Услуги</option>
          </select>
        </div>

        {/* Фильтр по статусу */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Все статусы</option>
            <option value="DRAFT">Черновики</option>
            <option value="PENDING">На модерации</option>
            <option value="APPROVED">Одобрено</option>
            <option value="REJECTED">Отклонено</option>
            <option value="NEEDS_REVISION">Требует правок</option>
          </select>
        </div>
      </div>

      {/* Список объявлений */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет объявлений</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'ALL' 
              ? 'Создайте первое объявление для вашего бизнеса'
              : 'Нет объявлений выбранного типа'
            }
          </p>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Создать объявление
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Заголовок и статус */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {listing.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[listing.status]}`}>
                  {STATUS_LABELS[listing.status]}
                </span>
              </div>

              {/* Тип */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {TYPE_LABELS[listing.type]}
                </span>
              </div>

              {/* Детали */}
              <div className="space-y-2 mb-4">
                {listing.eventDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(listing.eventDate)}</span>
                  </div>
                )}
                
                {listing.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{listing.address}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{formatPrice(listing.priceFrom, listing.priceTo)}</span>
                </div>

                {(listing.views || listing.bookings) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      {listing.views || 0} просмотров
                      {listing.bookings && ` • ${listing.bookings} бронирований`}
                    </span>
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(listing.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Просмотр"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(listing.id)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(listing.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  {formatDate(listing.updatedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
