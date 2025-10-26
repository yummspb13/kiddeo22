'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  RefreshCw, 
  Filter, 
  Calendar,
  Activity,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react'

interface User {
  id: number
  email: string
  name: string | null
  role: string
  createdAt: string
}

interface ActivityEvent {
  id: number
  eventType: string
  eventData: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface ActivityResponse {
  events: ActivityEvent[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    totalEvents: number
    eventTypes: Array<{ eventType: string; count: number }>
    lastActivity: string | null
    lastActivityType: string | null
  }
}

interface UserActivityClientProps {
  user: User
}

export default function UserActivityClient({ user }: UserActivityClientProps) {
  const [activity, setActivity] = useState<ActivityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Фильтры
  const [filters, setFilters] = useState({
    eventType: '',
    startDate: '',
    endDate: ''
  })
  
  // Пагинация
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50
  })

  // Загрузка активности
  const fetchActivity = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })
      
      const response = await fetch(`/api/admin/users/${user.id}/activity?${params}`)
      const data: ActivityResponse = await response.json()
      
      setActivity(data)
    } catch (error) {
      console.error('Error fetching activity:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [filters, pagination.page])

  // Обработка фильтров
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Получение типа события на русском
  const getEventTypeLabel = (eventType: string) => {
    const types = {
      'page_view': 'Просмотр страницы',
      'login': 'Вход в систему',
      'logout': 'Выход из системы',
      'search': 'Поиск',
      'booking': 'Бронирование',
      'review': 'Отзыв',
      'favorite': 'Добавление в избранное',
      'comment': 'Комментарий',
      'profile_update': 'Обновление профиля',
      'password_change': 'Смена пароля'
    }
    return types[eventType as keyof typeof types] || eventType
  }

  // Получение цвета типа события
  const getEventTypeColor = (eventType: string) => {
    const colors = {
      'page_view': 'bg-blue-100 text-blue-800',
      'login': 'bg-green-100 text-green-800',
      'logout': 'bg-red-100 text-red-800',
      'search': 'bg-yellow-100 text-yellow-800',
      'booking': 'bg-purple-100 text-purple-800',
      'review': 'bg-indigo-100 text-indigo-800',
      'favorite': 'bg-pink-100 text-pink-800',
      'comment': 'bg-cyan-100 text-cyan-800',
      'profile_update': 'bg-orange-100 text-orange-800',
      'password_change': 'bg-gray-100 text-gray-800'
    }
    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a
            href="/admin/users"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад к пользователям
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Активность пользователя
            </h1>
            <p className="text-gray-600">
              {user.name || 'Без имени'} ({user.email}) - {user.role}
            </p>
          </div>
        </div>
        <button
          onClick={fetchActivity}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>

      {/* Статистика */}
      {activity && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Всего событий</p>
                <p className="text-2xl font-bold">{activity.stats.totalEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Последняя активность</p>
                <p className="text-sm font-medium">
                  {activity.stats.lastActivity 
                    ? new Date(activity.stats.lastActivity).toLocaleString('ru-RU')
                    : 'Нет данных'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Типов событий</p>
                <p className="text-2xl font-bold">{activity.stats.eventTypes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Регистрация</p>
                <p className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип события
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все типы</option>
              {activity?.stats.eventTypes.map(type => (
                <option key={type.eventType} value={type.eventType}>
                  {getEventTypeLabel(type.eventType)} ({type.count})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата начала
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата окончания
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Список событий */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">События активности</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Загрузка...</span>
              </div>
            </div>
          ) : !activity?.events.length ? (
            <div className="px-6 py-12 text-center text-gray-500">
              События активности не найдены
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activity.events.map((event) => (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                          {getEventTypeLabel(event.eventType)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.createdAt).toLocaleString('ru-RU')}
                        </span>
                      </div>
                      
                      {event.eventData && Object.keys(event.eventData).length > 0 && (
                        <div className="mt-2">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                              Детали события
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(event.eventData, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        {event.ipAddress && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.ipAddress}
                          </div>
                        )}
                        {event.userAgent && (
                          <div className="flex items-center">
                            <Monitor className="w-3 h-3 mr-1" />
                            {event.userAgent.length > 50 
                              ? `${event.userAgent.substring(0, 50)}...` 
                              : event.userAgent
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Пагинация */}
        {activity && activity.pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={activity.pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Предыдущая
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={activity.pagination.page === activity.pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Следующая
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Показано{' '}
                    <span className="font-medium">
                      {(activity.pagination.page - 1) * activity.pagination.limit + 1}
                    </span>{' '}
                    -{' '}
                    <span className="font-medium">
                      {Math.min(activity.pagination.page * activity.pagination.limit, activity.pagination.total)}
                    </span>{' '}
                    из{' '}
                    <span className="font-medium">{activity.pagination.total}</span>{' '}
                    результатов
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: activity.pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === activity.pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

