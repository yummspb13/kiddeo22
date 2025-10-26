// src/components/admin/AdminAssistant.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Eye, 
  MousePointer,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Zap
} from "lucide-react"

interface AdminInsight {
  id: number
  type: 'USER_BEHAVIOR' | 'VENDOR_PERFORMANCE' | 'CONTENT_OPTIMIZATION' | 'REVENUE_OPTIMIZATION' | 'TECHNICAL_ISSUE' | 'SECURITY_ALERT'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  data: unknown
  recommendations?: unknown
  isResolved: boolean
  resolvedAt?: Date
  createdAt: Date
}

interface UserBehaviorStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
  avgSessionDuration: number
  bounceRate: number
  topPages: Array<{ page: string; views: number }>
  topActions: Array<{ action: string; count: number }>
}

interface VendorPerformanceStats {
  totalVendors: number
  activeVendors: number
  newVendors: number
  avgRevenue: number
  topPerformers: Array<{ name: string; revenue: number; growth: number }>
  underPerformers: Array<{ name: string; revenue: number; issues: string[] }>
}

const INSIGHT_TYPES = {
  USER_BEHAVIOR: { label: 'Поведение пользователей', color: 'bg-blue-500', icon: Users },
  VENDOR_PERFORMANCE: { label: 'Производительность вендоров', color: 'bg-green-500', icon: TrendingUp },
  CONTENT_OPTIMIZATION: { label: 'Оптимизация контента', color: 'bg-purple-500', icon: Target },
  REVENUE_OPTIMIZATION: { label: 'Оптимизация доходов', color: 'bg-yellow-500', icon: DollarSign },
  TECHNICAL_ISSUE: { label: 'Технические проблемы', color: 'bg-red-500', icon: AlertTriangle },
  SECURITY_ALERT: { label: 'Безопасность', color: 'bg-orange-500', icon: Zap }
}

const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
}

export default function AdminAssistant() {
  const [activeTab, setActiveTab] = useState<'insights' | 'analytics' | 'recommendations'>('insights')
  const [insights, setInsights] = useState<AdminInsight[]>([])
  const [userStats, setUserStats] = useState<UserBehaviorStats | null>(null)
  const [vendorStats, setVendorStats] = useState<VendorPerformanceStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadInsights()
    loadAnalytics()
  }, [])

  const loadInsights = async () => {
    // TODO: Загрузить инсайты с сервера
    const mockInsights: AdminInsight[] = [
      {
        id: 1,
        type: 'USER_BEHAVIOR',
        priority: 'HIGH',
        title: 'Высокий показатель отказов на странице каталога',
        description: 'Пользователи покидают страницу каталога через 15 секунд. Рекомендуется оптимизировать загрузку и улучшить UX.',
        data: { bounceRate: 68, avgTimeOnPage: 15, page: '/catalog' },
        recommendations: {
          actions: ['Оптимизировать загрузку изображений', 'Добавить фильтры', 'Улучшить мобильную версию']
        },
        isResolved: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: 2,
        type: 'VENDOR_PERFORMANCE',
        priority: 'MEDIUM',
        title: 'Низкая конверсия у новых вендоров',
        description: 'Вендоры с тарифом PREMIUM показывают в 3 раза лучшую конверсию. Рекомендуется улучшить онбординг.',
        data: { conversionRate: 12, premiumConversion: 35, newVendors: 15 },
        recommendations: {
          actions: ['Улучшить гайд онбординга', 'Добавить примеры успешных листингов', 'Внедрить A/B тестирование']
        },
        isResolved: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
      },
      {
        id: 3,
        type: 'REVENUE_OPTIMIZATION',
        priority: 'HIGH',
        title: 'Возможность увеличения доходов на 25%',
        description: 'Анализ показал, что можно увеличить доходы, оптимизировав ценообразование и добавив новые функции.',
        data: { currentRevenue: 150000, potentialRevenue: 187500, growth: 25 },
        recommendations: {
          actions: ['Внедрить динамическое ценообразование', 'Добавить премиум-функции', 'Оптимизировать комиссии']
        },
        isResolved: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
      },
      {
        id: 4,
        type: 'TECHNICAL_ISSUE',
        priority: 'CRITICAL',
        title: 'Медленная загрузка API',
        description: 'API запросы выполняются в среднем за 2.5 секунды. Критично для пользовательского опыта.',
        data: { avgResponseTime: 2500, threshold: 1000, affectedUsers: 1200 },
        recommendations: {
          actions: ['Оптимизировать запросы к БД', 'Добавить кеширование', 'Масштабировать серверы']
        },
        isResolved: true,
        resolvedAt: new Date(Date.now() - 1000 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ]
    setInsights(mockInsights)
  }

  const loadAnalytics = async () => {
    setIsLoading(true)
    
    // TODO: Загрузить аналитику с сервера
    const mockUserStats: UserBehaviorStats = {
      totalUsers: 15420,
      activeUsers: 3240,
      newUsers: 180,
      avgSessionDuration: 4.2,
      bounceRate: 42,
      topPages: [
        { page: '/catalog', views: 12500 },
        { page: '/city/moscow', views: 8900 },
        { page: '/vendor/dashboard', views: 3200 }
      ],
      topActions: [
        { action: 'view_listing', count: 45000 },
        { action: 'add_to_favorites', count: 12000 },
        { action: 'book_event', count: 3200 }
      ]
    }

    const mockVendorStats: VendorPerformanceStats = {
      totalVendors: 450,
      activeVendors: 320,
      newVendors: 25,
      avgRevenue: 12500,
      topPerformers: [
        { name: 'Детский центр "Радуга"', revenue: 45000, growth: 15 },
        { name: 'Студия танцев "Грация"', revenue: 38000, growth: 22 },
        { name: 'Школа программирования', revenue: 35000, growth: 8 }
      ],
      underPerformers: [
        { name: 'Мастер-классы "Творчество"', revenue: 2000, issues: ['Плохие фото', 'Нет описания'] },
        { name: 'Спортивная секция', revenue: 1500, issues: ['Высокая цена', 'Неудобное время'] }
      ]
    }

    setUserStats(mockUserStats)
    setVendorStats(mockVendorStats)
    setIsLoading(false)
  }

  const handleResolveInsight = async (id: number) => {
    // TODO: Отметить инсайт как решенный
    setInsights(prev => prev.map(insight => 
      insight.id === id 
        ? { ...insight, isResolved: true, resolvedAt: new Date() }
        : insight
    ))
  }

  const getInsightIcon = (type: string) => {
    const Icon = INSIGHT_TYPES[type as keyof typeof INSIGHT_TYPES]?.icon || AlertTriangle
    return <Icon className="w-5 h-5" />
  }

  const getInsightColor = (type: string) => {
    return INSIGHT_TYPES[type as keyof typeof INSIGHT_TYPES]?.color || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Административный ассистент</h2>
          <p className="text-gray-600">Умная аналитика и рекомендации для развития платформы</p>
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Инсайты
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Аналитика
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Рекомендации
          </button>
        </nav>
      </div>

      {/* Контент */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Статистика инсайтов */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Критичные</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {insights.filter(i => i.priority === 'CRITICAL' && !i.isResolved).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Высокий приоритет</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {insights.filter(i => i.priority === 'HIGH' && !i.isResolved).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Всего открытых</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {insights.filter(i => !i.isResolved).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Решено</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {insights.filter(i => i.isResolved).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Список инсайтов */}
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${getInsightColor(insight.type)} rounded-lg text-white`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[insight.priority]}`}>
                          {insight.priority}
                        </span>
                        {insight.isResolved && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Решено
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {insight.createdAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{insight.description}</p>

                {insight.recommendations && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Рекомендации:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {(insight.recommendations as any).actions.map((action: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600">{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!insight.isResolved && (
                  <button
                    onClick={() => handleResolveInsight(insight.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Отметить как решенное
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Пользовательская аналитика */}
              {userStats && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Поведение пользователей</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Всего пользователей</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{userStats.activeUsers.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Активных</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{userStats.newUsers}</p>
                      <p className="text-sm text-gray-500">Новых за день</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{userStats.avgSessionDuration}м</p>
                      <p className="text-sm text-gray-500">Средняя сессия</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Топ страниц</h4>
                      <div className="space-y-2">
                        {userStats.topPages.map((page, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{page.page}</span>
                            <span className="text-sm font-medium text-gray-900">{page.views.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Топ действия</h4>
                      <div className="space-y-2">
                        {userStats.topActions.map((action, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{action.action}</span>
                            <span className="text-sm font-medium text-gray-900">{action.count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Аналитика вендоров */}
              {vendorStats && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Производительность вендоров</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{vendorStats.totalVendors}</p>
                      <p className="text-sm text-gray-500">Всего вендоров</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{vendorStats.activeVendors}</p>
                      <p className="text-sm text-gray-500">Активных</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{vendorStats.avgRevenue.toLocaleString()}₽</p>
                      <p className="text-sm text-gray-500">Средний доход</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Топ исполнители</h4>
                      <div className="space-y-3">
                        {vendorStats.topPerformers.map((vendor, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{vendor.name}</p>
                              <p className="text-sm text-gray-600">+{vendor.growth}% рост</p>
                            </div>
                            <span className="text-lg font-bold text-green-600">{vendor.revenue.toLocaleString()}₽</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Требуют внимания</h4>
                      <div className="space-y-3">
                        {vendorStats.underPerformers.map((vendor, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{vendor.name}</p>
                              <p className="text-sm text-gray-600">{vendor.issues.join(', ')}</p>
                            </div>
                            <span className="text-lg font-bold text-red-600">{vendor.revenue.toLocaleString()}₽</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Умные рекомендации</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Оптимизация конверсии</h4>
                <p className="text-sm text-gray-600 mb-3">Добавьте A/B тестирование для главной страницы</p>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Применить
                </button>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Увеличение доходов</h4>
                <p className="text-sm text-gray-600 mb-3">Внедрите динамическое ценообразование</p>
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
