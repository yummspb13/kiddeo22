"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  UserPlus,
  Shield,
  Settings,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface User {
  id?: number
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

interface ContentSettingsProps {
  user: User
}

interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  status: string
  joinedAt: string
  lastActive: string
  permissions: string[]
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
}

export default function ContentSettings({ user }: ContentSettingsProps) {
  const [activeTab, setActiveTab] = useState("team")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddRole, setShowAddRole] = useState(false)

  useEffect(() => {
    // Заглушка для демонстрации
    setTeamMembers([
      {
        id: 1,
        name: "Анна Петрова",
        email: "anna.petrova@example.com",
        role: "CONTENT_CREATOR",
        status: "active",
        joinedAt: "2024-01-15T10:00:00",
        lastActive: "2024-09-15T14:30:00",
        permissions: ["create_content", "edit_own_content", "view_analytics"]
      },
      {
        id: 2,
        name: "Иван Сидоров",
        email: "ivan.sidorov@example.com",
        role: "AFISHA_EDITOR",
        status: "active",
        joinedAt: "2024-02-20T09:15:00",
        lastActive: "2024-09-15T16:45:00",
        permissions: ["create_content", "edit_all_content", "moderate_content", "publish_content"]
      },
      {
        id: 3,
        name: "Мария Козлова",
        email: "maria.kozlova@example.com",
        role: "MARKETER",
        status: "active",
        joinedAt: "2024-03-10T11:30:00",
        lastActive: "2024-09-15T12:20:00",
        permissions: ["view_analytics", "manage_plans", "export_data", "manage_team"]
      },
      {
        id: 4,
        name: "Петр Волков",
        email: "petr.volkov@example.com",
        role: "CONTENT_CREATOR",
        status: "inactive",
        joinedAt: "2024-04-05T14:00:00",
        lastActive: "2024-09-10T18:30:00",
        permissions: ["create_content", "edit_own_content"]
      }
    ])
    
    setRoles([
      {
        id: "CONTENT_CREATOR",
        name: "Контент-креатор",
        description: "Создает и редактирует контент, может просматривать аналитику",
        permissions: ["create_content", "edit_own_content", "view_analytics"],
        color: "blue"
      },
      {
        id: "AFISHA_EDITOR",
        name: "Редактор афиши",
        description: "Редактирует и модерирует весь контент, может публиковать",
        permissions: ["create_content", "edit_all_content", "moderate_content", "publish_content", "view_analytics"],
        color: "green"
      },
      {
        id: "MARKETER",
        name: "Маркетолог",
        description: "Управляет планами, аналитикой и командой",
        permissions: ["view_analytics", "manage_plans", "export_data", "manage_team", "create_content"],
        color: "purple"
      }
    ])
    
    setLoading(false)
  }, [])

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    return role?.color || "gray"
  }

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    return role?.name || roleId
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "inactive":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Активен"
      case "inactive":
        return "Неактивен"
      case "pending":
        return "Ожидает"
      default:
        return status
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-800"
      case "green":
        return "bg-green-100 text-green-800"
      case "purple":
        return "bg-purple-100 text-purple-800"
      case "orange":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка настроек...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Настройки контент-системы</h1>
              <p className="text-gray-600 mt-1">
                Управление командой, ролями и правами доступа
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("team")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "team"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Команда
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "roles"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Роли
              </button>
              <button
                onClick={() => setActiveTab("permissions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "permissions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Права доступа
              </button>
            </nav>
          </div>
        </div>

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Участники команды</h3>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Добавить участника</span>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(getRoleColor(member.role))}`}>
                              {getRoleName(member.role)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {getStatusIcon(member.status)}
                              <span className="ml-1">{getStatusLabel(member.status)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Последняя активность: {new Date(member.lastActive).toLocaleDateString('ru-RU')}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Роли в системе</h3>
                  <button
                    onClick={() => setShowAddRole(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Создать роль</span>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <div key={role.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(role.color)}`}>
                            {role.id}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{role.description}</p>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Права доступа:</h5>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Права доступа</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Контент</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                        <span className="text-sm text-gray-700">create_content - Создание контента</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                        <span className="text-sm text-gray-700">edit_own_content - Редактирование своего контента</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">edit_all_content - Редактирование всего контента</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">moderate_content - Модерация контента</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">publish_content - Публикация контента</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Аналитика</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                        <span className="text-sm text-gray-700">view_analytics - Просмотр аналитики</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">export_data - Экспорт данных</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">manage_plans - Управление планами</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Команда</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">manage_team - Управление командой</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                        <span className="text-sm text-gray-700">assign_roles - Назначение ролей</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
