"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  FileText, 
  Users, 
  BarChart3, 
  MapPin, 
  Calendar,
  Plus,
  Edit3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Share2,
  MessageSquare
} from "lucide-react"

interface User {
  id?: number
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

interface ContentDashboardProps {
  user: User
}

interface ContentStats {
  totalContent: number
  publishedContent: number
  draftContent: number
  pendingReview: number
  totalViews: number
  totalLikes: number
  totalShares: number
  totalComments: number
}

interface RecentContent {
  id: number
  title: string
  type: string
  status: string
  author: string
  createdAt: string
  views: number
  likes: number
}

export default function ContentDashboard({ user }: ContentDashboardProps) {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [recentContent, setRecentContent] = useState<RecentContent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Заглушка для демонстрации
    setStats({
      totalContent: 156,
      publishedContent: 89,
      draftContent: 45,
      pendingReview: 22,
      totalViews: 45678,
      totalLikes: 1234,
      totalShares: 567,
      totalComments: 234
    })
    
    setRecentContent([
      {
        id: 1,
        title: "Лучшие детские спектакли в Москве",
        type: "COLLECTION",
        status: "PUBLISHED",
        author: "Анна Петрова",
        createdAt: "2024-09-15T10:00:00",
        views: 1234,
        likes: 45
      },
      {
        id: 2,
        title: "Осенние мастер-классы для детей",
        type: "ARTICLE",
        status: "PENDING_REVIEW",
        author: "Иван Сидоров",
        createdAt: "2024-09-14T14:30:00",
        views: 0,
        likes: 0
      },
      {
        id: 3,
        title: "Спецпроект: День города",
        type: "SPECIAL_PROJECT",
        status: "DRAFT",
        author: "Мария Козлова",
        createdAt: "2024-09-13T09:15:00",
        views: 0,
        likes: 0
      },
      {
        id: 4,
        title: "Хиро в городе: Топ-10 мест",
        type: "HERO_CITY",
        status: "PUBLISHED",
        author: "Петр Волков",
        createdAt: "2024-09-12T16:45:00",
        views: 876,
        likes: 28
      }
    ])
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ARTICLE":
        return <FileText className="w-4 h-4" />
      case "COLLECTION":
        return <Users className="w-4 h-4" />
      case "SPECIAL_PROJECT":
        return <BarChart3 className="w-4 h-4" />
      case "HERO_CITY":
        return <MapPin className="w-4 h-4" />
      case "LAYOUT":
        return <Edit3 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ARTICLE":
        return "Статья"
      case "COLLECTION":
        return "Подборка"
      case "SPECIAL_PROJECT":
        return "Спецпроект"
      case "HERO_CITY":
        return "Хиро в городе"
      case "LAYOUT":
        return "Лайаут"
      default:
        return type
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "PENDING_REVIEW":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "DRAFT":
        return <Edit3 className="w-4 h-4 text-gray-600" />
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "ARCHIVED":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800"
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "APPROVED":
        return "bg-blue-100 text-blue-800"
      case "ARCHIVED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Опубликовано"
      case "PENDING_REVIEW":
        return "На модерации"
      case "DRAFT":
        return "Черновик"
      case "APPROVED":
        return "Одобрено"
      case "ARCHIVED":
        return "Архив"
      default:
        return status
    }
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка дашборда...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Контент-система</h1>
            <p className="text-gray-600 mt-1">
              Добро пожаловать, {user.name || 'Пользователь'}! Управляйте контентом и публикациями
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/content/new"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Создать контент</span>
            </Link>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего контента</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Опубликовано</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedContent}</p>
                <p className="text-sm text-gray-500">
                  {Math.round((stats.publishedContent / stats.totalContent) * 100)}% от общего
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">На модерации</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                <p className="text-sm text-yellow-600">Требует внимания</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Просмотры</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Лайки</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Репосты</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShares.toLocaleString()}</p>
              </div>
              <Share2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Комментарии</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Быстрые действия</h3>
            </div>
            <div className="p-6 space-y-4">
              <Link
                href="/content/new?type=ARTICLE"
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Создать статью</h4>
                  <p className="text-sm text-gray-600">Информационный материал</p>
                </div>
              </Link>
              
              <Link
                href="/content/new?type=COLLECTION"
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Создать подборку</h4>
                  <p className="text-sm text-gray-600">Коллекция событий</p>
                </div>
              </Link>
              
              <Link
                href="/content/new?type=SPECIAL_PROJECT"
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Спецпроект</h4>
                  <p className="text-sm text-gray-600">Специальный проект</p>
                </div>
              </Link>
              
              <Link
                href="/content/plans"
                className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Планы публикаций</h4>
                  <p className="text-sm text-gray-600">Управление расписанием</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Content */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Недавний контент</h3>
                <Link href="/content/all" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Все контент
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentContent.map((content) => (
                <div key={content.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{content.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                          {getStatusIcon(content.status)}
                          <span className="ml-1">{getStatusLabel(content.status)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center space-x-1">
                          {getTypeIcon(content.type)}
                          <span>{getTypeLabel(content.type)}</span>
                        </span>
                        <span>•</span>
                        <span>{content.author}</span>
                        <span>•</span>
                        <span>{new Date(content.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{content.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{content.likes}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
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
      </div>
    </div>
  )
}
