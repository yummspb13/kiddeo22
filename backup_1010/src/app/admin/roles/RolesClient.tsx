"use client"

import { useState, useEffect } from 'react'
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Crown,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  emailVerified: string | null
  image: string | null
}

interface Role {
  name: string
  displayName: string
  description: string
  color: string
  permissions: string[]
}

interface RoleStats {
  name: string
  displayName: string
  description: string
  color: string
  permissions: string[]
  count: number
  users: User[]
}

interface RolesData {
  roles: Role[]
  roleStats: RoleStats[]
  totalUsers: number
  usersByRole: Record<string, User[]>
}

interface RolesClientProps {
  keySuffix?: string
}

export default function RolesClient({ keySuffix = '' }: RolesClientProps) {
  const [data, setData] = useState<RolesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const url = `/api/admin/roles${keySuffix}`
      console.log('🔍 Fetching roles from:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const rolesData = await response.json()
      console.log('✅ Roles data received:', rolesData)
      setData(rolesData)
    } catch (error) {
      console.error('Error fetching roles:', error)
      setMessage({ type: 'error', text: 'Ошибка загрузки данных' })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRoles()
    setRefreshing(false)
  }

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/roles${keySuffix}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newRole: newRole
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка обновления роли')
      }

      const result = await response.json()
      setMessage({ type: 'success', text: result.message })
      await fetchRoles() // Обновляем данные
      setSelectedUser(null)
      setNewRole('')
    } catch (error) {
      console.error('Error updating role:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Ошибка обновления роли' })
    } finally {
      setUpdating(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="w-5 h-5 text-red-600" />
      case 'MANAGER':
        return <Settings className="w-5 h-5 text-blue-600" />
      case 'MODERATOR':
        return <Shield className="w-5 h-5 text-green-600" />
      case 'VENDOR':
        return <UserCheck className="w-5 h-5 text-purple-600" />
      case 'USER':
        return <Users className="w-5 h-5 text-gray-600" />
      default:
        return <Users className="w-5 h-5 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'MODERATOR':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'VENDOR':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'USER':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
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
            <p className="text-gray-600 mb-4">Не удалось загрузить данные о ролях</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление ролями</h1>
            <p className="text-gray-600">Назначение ролей пользователям и управление правами доступа</p>
          </div>
          
          <div className="flex gap-4 mt-4 sm:mt-0">
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

        {/* Сообщения */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Статистика по ролям */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {data.roleStats.map((role) => (
            <div key={role.name} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                {getRoleIcon(role.name)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{role.displayName}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{role.count}</div>
              <div className="text-sm text-gray-600">пользователей</div>
            </div>
          ))}
        </div>

        {/* Детальная информация по ролям */}
        <div className="space-y-8">
          {data.roleStats.map((role) => (
            <div key={role.name} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getRoleIcon(role.name)}
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{role.displayName}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleColor(role.name)}`}>
                    {role.count} пользователей
                  </span>
                </div>
              </div>

              {/* Права доступа */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Права доступа:</h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              {/* Список пользователей */}
              <div className="px-6 py-4">
                {role.users.length > 0 ? (
                  <div className="space-y-3">
                    {role.users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Зарегистрирован: {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            {role.displayName}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setNewRole('')
                            }}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Изменить роль
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Нет пользователей с этой ролью</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Модальное окно изменения роли */}
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Изменение роли</h3>
                  <button
                    onClick={() => {
                      setSelectedUser(null)
                      setNewRole('')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Пользователь:</p>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новая роль:
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите роль</option>
                    {data.roles.map((role) => (
                      <option key={role.name} value={role.name}>
                        {role.displayName} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(null)
                      setNewRole('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUser, newRole)}
                    disabled={!newRole || updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Обновление...' : 'Изменить роль'}
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