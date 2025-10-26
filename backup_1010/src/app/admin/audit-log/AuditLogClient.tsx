"use client"

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles
} from 'lucide-react'

interface AuditLogEntry {
  id: number
  entityType: string
  entityId: string
  action: string
  details: unknown
  userId: number
  ipAddress: string | null
  createdAt: string
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

interface AuditLogData {
  auditLogs: AuditLogEntry[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  statistics: {
    entityTypeStats: Array<{
      entityType: string
      _count: { id: number }
    }>
    actionStats: Array<{
      action: string
      _count: { id: number }
    }>
    userStats: Array<{
      userId: number
      userName: string
      userEmail: string
      userRole: string
      actionsCount: number
    }>
  }
}

interface AuditLogClientProps {
  keySuffix?: string
}

export default function AuditLogClient({ keySuffix = '' }: AuditLogClientProps) {
  const [data, setData] = useState<AuditLogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<number[]>([])
  const [showChatGPT, setShowChatGPT] = useState(false)

  useEffect(() => {
    fetchAuditLog()
  }, [page, filters])

  const fetchAuditLog = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...filters
      })
      
      const url = `/api/admin/audit-log?${params}${keySuffix}`
      console.log('🔍 Fetching audit log from:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const auditData = await response.json()
      console.log('✅ Audit log data received:', auditData)
      setData(auditData)
    } catch (error) {
      console.error('Error fetching audit log:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAuditLog()
    setRefreshing(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Сбрасываем на первую страницу при изменении фильтров
  }

  const clearFilters = () => {
    setFilters({
      entityType: '',
      action: '',
      userId: '',
      dateFrom: '',
      dateTo: ''
    })
    setPage(1)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECT':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'REQUEST_INFO':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'CREATE':
        return <Activity className="w-4 h-4 text-blue-600" />
      case 'UPDATE':
        return <RefreshCw className="w-4 h-4 text-orange-600" />
      case 'DELETE':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVE':
        return 'bg-green-100 text-green-800'
      case 'REJECT':
        return 'bg-red-100 text-red-800'
      case 'REQUEST_INFO':
        return 'bg-yellow-100 text-yellow-800'
      case 'CREATE':
        return 'bg-blue-100 text-blue-800'
      case 'UPDATE':
        return 'bg-orange-100 text-orange-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'VENDOR':
        return 'bg-purple-100 text-purple-800'
      case 'LISTING_CLAIM':
        return 'bg-blue-100 text-blue-800'
      case 'USER':
        return 'bg-green-100 text-green-800'
      case 'EVENT':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleSelectEntry = (id: number) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (data) {
      if (selectedEntries.length === data.auditLogs.length) {
        setSelectedEntries([])
      } else {
        setSelectedEntries(data.auditLogs.map(entry => entry.id))
      }
    }
  }

  const prepareForChatGPT = () => {
    if (!data || selectedEntries.length === 0) return

    const selectedData = data.auditLogs.filter(entry => selectedEntries.includes(entry.id))
    
    const analysisData = {
      summary: {
        totalEntries: selectedEntries.length,
        dateRange: {
          from: Math.min(...selectedData.map(e => new Date(e.createdAt).getTime())),
          to: Math.max(...selectedData.map(e => new Date(e.createdAt).getTime()))
        },
        entityTypes: [...new Set(selectedData.map(e => e.entityType))],
        actions: [...new Set(selectedData.map(e => e.action))],
        moderators: [...new Set(selectedData.map(e => e.user.name))]
      },
      entries: selectedData.map(entry => ({
        id: entry.id,
        timestamp: entry.createdAt,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        moderator: {
          name: entry.user.name,
          email: entry.user.email,
          role: entry.user.role
        },
        details: entry.details,
        ipAddress: entry.ipAddress
      }))
    }

    return analysisData
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h2>
            <p className="text-gray-600 mb-4">Не удалось загрузить записи аудита</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и действия */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Журнал аудита</h1>
            <p className="text-gray-600">Отслеживание действий модераторов и пользователей</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Фильтры
            </button>

            {selectedEntries.length > 0 && (
              <button
                onClick={() => setShowChatGPT(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Анализ ChatGPT ({selectedEntries.length})
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Обновить
            </button>
          </div>
        </div>

        {/* Фильтры */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Фильтры</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип сущности</label>
                <select
                  value={filters.entityType}
                  onChange={(e) => handleFilterChange('entityType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все типы</option>
                  <option value="VENDOR">Вендоры</option>
                  <option value="LISTING_CLAIM">Заявки на клайм</option>
                  <option value="USER">Пользователи</option>
                  <option value="EVENT">События</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Действие</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все действия</option>
                  <option value="APPROVE">Одобрить</option>
                  <option value="REJECT">Отклонить</option>
                  <option value="REQUEST_INFO">Запросить информацию</option>
                  <option value="CREATE">Создать</option>
                  <option value="UPDATE">Обновить</option>
                  <option value="DELETE">Удалить</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пользователь</label>
                <select
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все пользователи</option>
                  {data.statistics.userStats.map(user => (
                    <option key={user.userId} value={user.userId}>
                      {user.userName} ({user.actionsCount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Дата от</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Дата до</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Очистить фильтры
              </button>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold text-gray-900">{data.pagination.totalCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активных модераторов</p>
                <p className="text-2xl font-bold text-gray-900">{data.statistics.userStats.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Типов сущностей</p>
                <p className="text-2xl font-bold text-gray-900">{data.statistics.entityTypeStats.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Типов действий</p>
                <p className="text-2xl font-bold text-gray-900">{data.statistics.actionStats.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица записей аудита */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Записи аудита</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedEntries.length === data.auditLogs.length && data.auditLogs.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Выбрать все</span>
                </label>
                <span className="text-sm text-gray-500">
                  {selectedEntries.length} из {data.auditLogs.length} выбрано
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Выбор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сущность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действие
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Модератор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Детали
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.auditLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEntityTypeColor(entry.entityType)}`}>
                          {entry.entityType}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">#{entry.entityId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getActionIcon(entry.action)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{entry.user.name}</div>
                        <div className="text-sm text-gray-500">{entry.user.email}</div>
                        <div className="text-xs text-gray-400">{entry.user.role}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => console.log('Details:', entry.details)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!data.pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Показано{' '}
                  <span className="font-medium">{(page - 1) * data.pagination.limit + 1}</span>
                  {' '}до{' '}
                  <span className="font-medium">
                    {Math.min(page * data.pagination.limit, data.pagination.totalCount)}
                  </span>
                  {' '}из{' '}
                  <span className="font-medium">{data.pagination.totalCount}</span>
                  {' '}результатов
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!data.pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {page} из {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!data.pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* ChatGPT Analysis Modal */}
        {showChatGPT && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-purple-600" />
                    Анализ ChatGPT
                  </h3>
                  <button
                    onClick={() => setShowChatGPT(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Выбрано {selectedEntries.length} записей для анализа
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-700 overflow-auto max-h-64">
                      {JSON.stringify(prepareForChatGPT(), null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      const analysisData = prepareForChatGPT()
                      navigator.clipboard.writeText(JSON.stringify(analysisData, null, 2))
                      alert('Данные скопированы в буфер обмена!')
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Копировать JSON
                  </button>
                  <button
                    onClick={() => setShowChatGPT(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
