// src/components/vendor/ModerationManager.tsx
"use client"

import { useState } from "react"
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MessageSquare,
  Send,
  Edit
} from "lucide-react"

interface ModerationItem {
  id: number
  listingId: number
  title: string
  type: 'EVENT' | 'VENUE' | 'SERVICE'
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'
  submittedAt: Date
  reviewedAt?: Date
  comment?: string
  moderatorName?: string
  version: number
}

interface ModerationManagerProps {
  items: ModerationItem[]
  onResubmit: (id: number) => void
  onEdit: (id: number) => void
  onView: (id: number) => void
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  NEEDS_REVISION: 'bg-orange-100 text-orange-800'
}

const STATUS_ICONS = {
  DRAFT: <Edit className="w-4 h-4" />,
  PENDING: <Clock className="w-4 h-4" />,
  APPROVED: <CheckCircle className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
  NEEDS_REVISION: <AlertTriangle className="w-4 h-4" />
}

const STATUS_LABELS = {
  DRAFT: 'Черновик',
  PENDING: 'На модерации',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
  NEEDS_REVISION: 'Требует правок'
}

const TYPE_LABELS = {
  EVENT: 'Событие',
  VENUE: 'Место',
  SERVICE: 'Услуга'
}

export default function ModerationManager({ 
  items, 
  onResubmit, 
  onEdit, 
  onView 
}: ModerationManagerProps) {
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION'>('ALL')
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null)

  const filteredItems = items.filter(item => 
    filter === 'ALL' || item.status === filter
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusKey = status as keyof typeof STATUS_COLORS
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[statusKey] || 'bg-gray-100 text-gray-800'}`}>
        {STATUS_ICONS[statusKey] || <div className="w-2 h-2 bg-gray-400 rounded-full" />}
        <span className="ml-1">{STATUS_LABELS[statusKey] || status}</span>
      </span>
    )
  }

  const getActionButtons = (item: ModerationItem) => {
    switch (item.status) {
      case 'DRAFT':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(item.id)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
            >
              Редактировать
            </button>
            <button
              onClick={() => onResubmit(item.id)}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
            >
              Отправить на модерацию
            </button>
          </div>
        )
      case 'PENDING':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onView(item.id)}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
            >
              Просмотр
            </button>
          </div>
        )
      case 'REJECTED':
      case 'NEEDS_REVISION':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(item.id)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
            >
              Исправить
            </button>
            <button
              onClick={() => onView(item.id)}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
            >
              Просмотр
            </button>
          </div>
        )
      case 'APPROVED':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onView(item.id)}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
            >
              Просмотр
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Модерация контента</h2>
          <p className="text-gray-600">Отслеживайте статус ваших объявлений</p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex space-x-2">
        {[
          { value: 'ALL', label: 'Все' },
          { value: 'DRAFT', label: 'Черновики' },
          { value: 'PENDING', label: 'На модерации' },
          { value: 'APPROVED', label: 'Одобрено' },
          { value: 'REJECTED', label: 'Отклонено' },
          { value: 'NEEDS_REVISION', label: 'Требует правок' }
        ].map((filterOption) => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value as any)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === filterOption.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Список объявлений */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredItems.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Нет объявлений</h4>
            <p className="text-gray-600">
              {filter === 'ALL' 
                ? 'Создайте первое объявление'
                : 'Нет объявлений с выбранным статусом'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      {getStatusBadge(item.status)}
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {TYPE_LABELS[item.type]}
                      </span>
                      <span className="text-sm text-gray-500">
                        v{item.version}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Отправлено: {formatDate(item.submittedAt)}</span>
                      </div>
                      
                      {item.reviewedAt && (
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span>Проверено: {formatDate(item.reviewedAt)}</span>
                        </div>
                      )}
                      
                      {item.moderatorName && (
                        <div className="flex items-center">
                          <span>Модератор: {item.moderatorName}</span>
                        </div>
                      )}
                    </div>

                    {item.comment && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Комментарий модератора:</strong> {item.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {getActionButtons(item)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Статистика модерации */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">На модерации</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Одобрено</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Отклонено</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.status === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Требует правок</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.status === 'NEEDS_REVISION').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
