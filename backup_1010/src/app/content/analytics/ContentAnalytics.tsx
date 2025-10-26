"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageSquare,
  Calendar,
  Filter,
  Download,
  FileText,
  Users,
  MapPin,
  Layout
} from "lucide-react"

interface User {
  id?: number
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ContentAnalyticsProps {
  user: User
}

interface AnalyticsData {
  totalViews: number
  totalLikes: number
  totalShares: number
  totalComments: number
  avgTimeOnPage: number
  bounceRate: number
  topContent: Array<{
    id: number
    title: string
    views: number
    likes: number
    shares: number
    type: string
  }>
  viewsByType: Array<{
    type: string
    views: number
    percentage: number
  }>
  dailyViews: Array<{
    date: string
    views: number
    uniqueViews: number
  }>
}

export default function ContentAnalytics({ user }: ContentAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    // Заглушка для демонстрации
    setData({
      totalViews: 45678,
      totalLikes: 1234,
      totalShares: 567,
      totalComments: 234,
      avgTimeOnPage: 2.5,
      bounceRate: 35.2,
      topContent: [
        {
          id: 1,
          title: "Лучшие детские спектакли в Москве",
          views: 1234,
          likes: 45,
          shares: 12,
          type: "COLLECTION"
        },
        {
          id: 2,
          title: "Осенние мастер-классы для детей",
          views: 987,
          likes: 32,
          shares: 8,
          type: "ARTICLE"
        },
        {
          id: 3,
          title: "Спецпроект: День города",
          views: 876,
          likes: 28,
          shares: 15,
          type: "SPECIAL_PROJECT"
        },
        {
          id: 4,
          title: "Хиро в городе: Топ-10 мест",
          views: 765,
          likes: 41,
          shares: 9,
          type: "HERO_CITY"
        }
      ],
      viewsByType: [
        { type: "Статьи", views: 15678, percentage: 34.3 },
        { type: "Подборки", views: 12345, percentage: 27.0 },
        { type: "Спецпроекты", views: 9876, percentage: 21.6 },
        { type: "Хиро в городе", views: 7779, percentage: 17.0 }
      ],
      dailyViews: [
        { date: "2024-09-01", views: 1200, uniqueViews: 980 },
        { date: "2024-09-02", views: 1350, uniqueViews: 1100 },
        { date: "2024-09-03", views: 1100, uniqueViews: 900 },
        { date: "2024-09-04", views: 1600, uniqueViews: 1300 },
        { date: "2024-09-05", views: 1800, uniqueViews: 1450 },
        { date: "2024-09-06", views: 2000, uniqueViews: 1600 },
        { date: "2024-09-07", views: 2200, uniqueViews: 1750 }
      ]
    })
    
    setLoading(false)
  }, [dateRange])

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
        return <Layout className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ARTICLE":
        return "bg-blue-100 text-blue-800"
      case "COLLECTION":
        return "bg-green-100 text-green-800"
      case "SPECIAL_PROJECT":
        return "bg-purple-100 text-purple-800"
      case "HERO_CITY":
        return "bg-orange-100 text-orange-800"
      case "LAYOUT":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка аналитики...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Аналитика контента</h1>
              <p className="text-gray-600 mt-1">
                Статистика и метрики публикаций
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Последние 7 дней</option>
                <option value="30d">Последние 30 дней</option>
                <option value="90d">Последние 90 дней</option>
                <option value="1y">Последний год</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                <span>Фильтры</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Экспорт</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Просмотры</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Лайки</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalLikes.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Репосты</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalShares.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.3%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Комментарии</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalComments.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.7%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Время на странице</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">{data.avgTimeOnPage} мин</div>
            <p className="text-sm text-gray-500">Среднее время чтения</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Процент отказов</h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">{data.bounceRate}%</div>
            <p className="text-sm text-gray-500">Пользователи покинули страницу</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Конверсия</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">12.3%</div>
            <p className="text-sm text-gray-500">Просмотр → Действие</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Content */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Топ контента</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {data.topContent.map((content, index) => (
                <div key={content.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <h4 className="font-medium text-gray-900">{content.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(content.type)}`}>
                          {getTypeIcon(content.type)}
                          <span className="ml-1">{getTypeLabel(content.type)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{content.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{content.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share2 className="w-3 h-3" />
                          <span>{content.shares}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Views by Type */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Просмотры по типам</h3>
            </div>
            <div className="p-6">
              {data.viewsByType.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.type}</span>
                    <span className="text-sm text-gray-500">{item.views.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.percentage}% от общего</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Views Chart */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Динамика просмотров</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end space-x-2">
              {data.dailyViews.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-100 rounded-t mb-2 relative group">
                    <div
                      className="bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                      style={{ height: `${(day.views / Math.max(...data.dailyViews.map(d => d.views))) * 200}px` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.views} просмотров
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
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
