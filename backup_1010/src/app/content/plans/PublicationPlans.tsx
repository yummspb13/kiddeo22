"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  BarChart3,
  Eye,
  Play
} from "lucide-react"

interface User {
  id?: number
  name?: string | null
  email?: string | null
  image?: string | null
}

interface PublicationPlansProps {
  user: User
}

interface PublicationPlan {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  isActive: boolean
  createdBy: string
  createdAt: string
  itemsCount: number
  completedItems: number
}

interface PlanItem {
  id: number
  planId: number
  title: string
  description: string
  scheduledDate: string
  status: string
  assignedTo: string
  contentId?: number
  priority: string
}

export default function PublicationPlans({ user }: PublicationPlansProps) {
  const [plans, setPlans] = useState<PublicationPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PublicationPlan | null>(null)
  const [planItems, setPlanItems] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Заглушка для демонстрации
    setPlans([
      {
        id: 1,
        title: "Осенний контент-план",
        description: "План публикаций на осенний период с акцентом на детские мероприятия",
        startDate: "2024-09-01",
        endDate: "2024-11-30",
        isActive: true,
        createdBy: "Анна Петрова",
        createdAt: "2024-08-25T10:00:00",
        itemsCount: 12,
        completedItems: 8
      },
      {
        id: 2,
        title: "Новогодние спецпроекты",
        description: "Специальные проекты к новому году",
        startDate: "2024-12-01",
        endDate: "2025-01-15",
        isActive: true,
        createdBy: "Иван Сидоров",
        createdAt: "2024-11-15T14:30:00",
        itemsCount: 6,
        completedItems: 2
      },
      {
        id: 3,
        title: "Летний контент",
        description: "План на летний период (завершен)",
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        isActive: false,
        createdBy: "Мария Козлова",
        createdAt: "2024-05-20T09:15:00",
        itemsCount: 15,
        completedItems: 15
      }
    ])
    
    setLoading(false)
  }, [])

  const handleSelectPlan = (plan: PublicationPlan) => {
    setSelectedPlan(plan)
    // Заглушка для элементов плана
    setPlanItems([
      {
        id: 1,
        planId: plan.id,
        title: "Лучшие детские спектакли в Москве",
        description: "Подборка театральных постановок для детей",
        scheduledDate: "2024-09-15T10:00:00",
        status: "completed",
        assignedTo: "Анна Петрова",
        contentId: 1,
        priority: "HIGH"
      },
      {
        id: 2,
        planId: plan.id,
        title: "Осенние мастер-классы",
        description: "Статья о творческих мастер-классах",
        scheduledDate: "2024-09-20T14:00:00",
        status: "in_progress",
        assignedTo: "Иван Сидоров",
        priority: "NORMAL"
      },
      {
        id: 3,
        planId: plan.id,
        title: "Хиро в городе: Топ-10 мест",
        description: "Специальный проект о лучших местах для детей",
        scheduledDate: "2024-09-25T12:00:00",
        status: "planned",
        assignedTo: "Мария Козлова",
        priority: "HIGH"
      }
    ])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "planned":
        return <Calendar className="w-4 h-4 text-gray-600" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "planned":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершено"
      case "in_progress":
        return "В работе"
      case "planned":
        return "Запланировано"
      case "cancelled":
        return "Отменено"
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "NORMAL":
        return "bg-blue-100 text-blue-800"
      case "LOW":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "Срочно"
      case "HIGH":
        return "Высокий"
      case "NORMAL":
        return "Обычный"
      case "LOW":
        return "Низкий"
      default:
        return priority
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка планов...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Планы публикаций</h1>
              <p className="text-gray-600 mt-1">
                Управление контент-планами и расписанием публикаций
              </p>
            </div>
            <Link
              href="/content/plans/new"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Создать план</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Планы публикаций</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPlan?.id === plan.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{plan.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.isActive ? 'Активен' : 'Завершен'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{plan.itemsCount} элементов</span>
                      <span>{plan.completedItems} завершено</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(plan.completedItems / plan.itemsCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedPlan.title}</h2>
                      <p className="text-gray-600 mt-1">{selectedPlan.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Период:</span>
                      <p className="font-medium">
                        {new Date(selectedPlan.startDate).toLocaleDateString('ru-RU')} - 
                        {selectedPlan.endDate ? new Date(selectedPlan.endDate).toLocaleDateString('ru-RU') : '∞'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Создатель:</span>
                      <p className="font-medium">{selectedPlan.createdBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Элементов:</span>
                      <p className="font-medium">{selectedPlan.itemsCount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Завершено:</span>
                      <p className="font-medium">{selectedPlan.completedItems}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Items */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Элементы плана</h3>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Добавить элемент
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {planItems.map((item) => (
                      <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{getStatusLabel(item.status)}</span>
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                {getPriorityLabel(item.priority)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Назначен: {item.assignedTo}</span>
                              <span>•</span>
                              <span>
                                {new Date(item.scheduledDate).toLocaleDateString('ru-RU', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {item.contentId && (
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Play className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите план</h3>
                <p className="text-gray-500">
                  Выберите план публикаций из списка слева, чтобы просмотреть его детали
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
