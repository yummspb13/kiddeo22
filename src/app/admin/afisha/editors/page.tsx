// src/app/admin/afisha/editors/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { Users, Plus, Search, Filter, Edit, Trash2, Eye, UserCheck, Calendar, Activity, Award } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AfishaEditorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  // Моковые данные редакторов
  const mockEditors = [
    {
      id: 1,
      name: 'Анна Петрова',
      email: 'anna.petrova@example.com',
      role: 'AFISHA_EDITOR',
      status: 'active',
      joinedAt: '2023-06-15',
      lastActive: '2024-01-15T14:30:00Z',
      eventsCreated: 45,
      eventsApproved: 120,
      eventsRejected: 8,
      performance: 95,
      cities: ['Москва', 'СПб'],
      permissions: ['create_events', 'moderate_events', 'manage_ads']
    },
    {
      id: 2,
      name: 'Михаил Сидоров',
      email: 'mikhail.sidorov@example.com',
      role: 'AFISHA_EDITOR',
      status: 'active',
      joinedAt: '2023-08-20',
      lastActive: '2024-01-14T16:45:00Z',
      eventsCreated: 32,
      eventsApproved: 89,
      eventsRejected: 12,
      performance: 88,
      cities: ['Москва'],
      permissions: ['create_events', 'moderate_events']
    },
    {
      id: 3,
      name: 'Елена Козлова',
      email: 'elena.kozlova@example.com',
      role: 'AFISHA_EDITOR',
      status: 'inactive',
      joinedAt: '2023-04-10',
      lastActive: '2023-12-20T10:15:00Z',
      eventsCreated: 28,
      eventsApproved: 67,
      eventsRejected: 5,
      performance: 92,
      cities: ['СПб'],
      permissions: ['create_events']
    },
    {
      id: 4,
      name: 'Дмитрий Волков',
      email: 'dmitry.volkov@example.com',
      role: 'AFISHA_EDITOR',
      status: 'pending',
      joinedAt: '2024-01-10',
      lastActive: '2024-01-15T09:20:00Z',
      eventsCreated: 3,
      eventsApproved: 0,
      eventsRejected: 0,
      performance: 0,
      cities: ['Москва'],
      permissions: ['create_events']
    }
  ]

  const stats = {
    total: mockEditors.length,
    active: mockEditors.filter(editor => editor.status === 'active').length,
    inactive: mockEditors.filter(editor => editor.status === 'inactive').length,
    pending: mockEditors.filter(editor => editor.status === 'pending').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен'
      case 'inactive': return 'Неактивен'
      case 'pending': return 'Ожидает активации'
      default: return 'Неизвестно'
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600'
    if (performance >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Редакторы афиши</h1>
          <p className="text-sm text-gray-600">Управление редакторами афиши и их правами</p>
        </div>
        <Link
          href={`/admin/afisha/editors/create${k}`}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить редактора
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Всего редакторов</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Ожидают активации</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Activity className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Неактивных</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск редакторов..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
            <option value="pending">Ожидают активации</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="">Все города</option>
            <option value="moscow">Москва</option>
            <option value="spb">СПб</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="">Все роли</option>
            <option value="AFISHA_EDITOR">Редактор афиши</option>
            <option value="MODERATOR">Модератор</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </div>

      {/* Таблица редакторов */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Список редакторов</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Редактор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статистика
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Производительность
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Города
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Последняя активность
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockEditors.map((editor) => (
                <tr key={editor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-cyan-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {editor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {editor.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(editor.status)}`}>
                      {getStatusText(editor.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Создано: {editor.eventsCreated}
                    </div>
                    <div className="text-sm text-gray-500">
                      Одобрено: {editor.eventsApproved} | Отклонено: {editor.eventsRejected}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-cyan-600 h-2 rounded-full" 
                          style={{ width: `${editor.performance}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getPerformanceColor(editor.performance)}`}>
                        {editor.performance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {editor.cities.map((city, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {city}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(editor.lastActive).toLocaleDateString('ru-RU')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(editor.lastActive).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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

      {/* Детализация по правам */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Права доступа редакторов</h3>
        <div className="space-y-4">
          {mockEditors.map((editor) => (
            <div key={editor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{editor.name}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(editor.status)}`}>
                  {getStatusText(editor.status)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Права доступа:</h5>
                  <div className="space-y-1">
                    {editor.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center">
                        <Award className="w-3 h-3 text-green-500 mr-2" />
                        <span className="text-xs text-gray-600">
                          {permission === 'create_events' ? 'Создание событий' :
                           permission === 'moderate_events' ? 'Модерация событий' :
                           permission === 'manage_ads' ? 'Управление рекламой' : permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Статистика работы:</h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Создано событий: {editor.eventsCreated}</p>
                    <p>Одобрено: {editor.eventsApproved}</p>
                    <p>Отклонено: {editor.eventsRejected}</p>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Активность:</h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Присоединился: {new Date(editor.joinedAt).toLocaleDateString('ru-RU')}</p>
                    <p>Последняя активность: {new Date(editor.lastActive).toLocaleDateString('ru-RU')}</p>
                    <p>Производительность: {editor.performance}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
