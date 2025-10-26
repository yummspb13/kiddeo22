'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Shield, 
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'

interface User {
  id: number
  email: string
  name: string | null
  role: 'USER' | 'VENDOR' | 'ADMIN'
  emailVerified: string | null
  image: string | null
  createdAt: string
  updatedAt: string
  stats: {
    bookingsCount: number
    reviewsCount: number
    commentsCount: number
    favoritesCount: number
    loyaltyPoints: number
    roleAssignmentsCount: number
  }
  roleAssignments: unknown[]
  isActive: boolean
  lastActivity: string
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface StatsResponse {
  overview: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    newUsers: number
    activePercentage: number
  }
  byRole: Array<{ role: string; count: number }>
  byStatus: {
    verified: number
    unverified: number
  }
  loyalty: {
    totalPoints: number
    averagePoints: number
    usersWithPoints: number
  }
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Формы
  const [createForm, setCreateForm] = useState({
    email: '',
    name: '',
    role: 'USER' as 'USER' | 'VENDOR' | 'ADMIN',
    sendWelcomeEmail: false
  })
  
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'USER' as 'USER' | 'VENDOR' | 'ADMIN',
    isActive: false
  })
  
  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  
  // Пагинация
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })
      
      const response = await fetch(`/api/admin/users?${params}`)
      const data: UsersResponse = await response.json()
      
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка статистики
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats')
      const data: StatsResponse = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [filters, pagination.page])

  // Обработка фильтров
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Обработка выбора пользователей
  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
  }

  // Массовые операции
  const handleBulkAction = async (action: string, data?: unknown) => {
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
          data
        })
      })

      if (response.ok) {
        await fetchUsers()
        setSelectedUsers([])
        setShowBulkActions(false)
      }
    } catch (error) {
      console.error('Error in bulk action:', error)
    }
  }

  // Удаление пользователя
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  // Создание пользователя
  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        await fetchUsers()
        setShowCreateModal(false)
        setCreateForm({ email: '', name: '', role: 'USER', sendWelcomeEmail: false })
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  // Редактирование пользователя
  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        await fetchUsers()
        setShowEditModal(false)
        setEditingUser(null)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // Открытие модального окна редактирования
  const openEditModal = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      role: user.role,
      isActive: user.isActive
    })
    setShowEditModal(true)
  }

  // Получение роли на русском
  const getRoleLabel = (role: string) => {
    const roles = {
      'USER': 'Пользователь',
      'VENDOR': 'Вендор',
      'ADMIN': 'Администратор'
    }
    return roles[role as keyof typeof roles] || role
  }

  // Получение цвета роли
  const getRoleColor = (role: string) => {
    const colors = {
      'USER': 'bg-blue-100 text-blue-800',
      'VENDOR': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-red-100 text-red-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600">Управление пользователями системы</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Добавить пользователя
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold">{stats.overview.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Активных</p>
                <p className="text-2xl font-bold">{stats.overview.activeUsers}</p>
                <p className="text-xs text-gray-500">{stats.overview.activePercentage}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Plus className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Новых за месяц</p>
                <p className="text-2xl font-bold">{stats.overview.newUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Баллов лояльности</p>
                <p className="text-2xl font-bold">{stats.loyalty.totalPoints}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Поиск по имени или email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Роль
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все роли</option>
              <option value="USER">Пользователь</option>
              <option value="VENDOR">Вендор</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сортировка
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleFilterChange('sortBy', sortBy)
                handleFilterChange('sortOrder', sortOrder)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Дата создания (новые)</option>
              <option value="createdAt-asc">Дата создания (старые)</option>
              <option value="name-asc">Имя (А-Я)</option>
              <option value="name-desc">Имя (Я-А)</option>
              <option value="email-asc">Email (А-Я)</option>
              <option value="email-desc">Email (Я-А)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Массовые действия */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              Выбрано пользователей: {selectedUsers.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Активировать
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                Деактивировать
              </button>
              <button
                onClick={() => handleBulkAction('changeRole', { role: 'VENDOR' })}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Сделать вендором
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Таблица пользователей */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статистика
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Загрузка...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.image ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.image}
                              alt={user.name || user.email}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {(user.name || user.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'Без имени'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Активен</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-600">Неактивен</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Заказов: {user.stats.bookingsCount}</div>
                        <div>Отзывов: {user.stats.reviewsCount}</div>
                        <div>Баллов: {user.stats.loyaltyPoints}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.lastActivity).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/admin/users/${user.id}/activity`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                          title="Просмотр активности"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Предыдущая
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
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
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    -{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    из{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    результатов
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
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

      {/* Модальное окно создания пользователя */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Создать пользователя</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Имя пользователя"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Роль
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">Пользователь</option>
                  <option value="VENDOR">Вендор</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  checked={createForm.sendWelcomeEmail}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sendWelcomeEmail" className="ml-2 text-sm text-gray-700">
                  Отправить приветственное письмо
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования пользователя */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Редактировать пользователя</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Имя пользователя"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Роль
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">Пользователь</option>
                  <option value="VENDOR">Вендор</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Активный пользователь
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
