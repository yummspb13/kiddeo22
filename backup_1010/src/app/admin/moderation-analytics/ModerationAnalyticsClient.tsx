"use client"

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Award,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  period: string
  vendorType: string
  summary: {
    totalApplications: number
    avgProcessingTime: number
    conversionRate: number
    sla24hRate: number
    sla48hRate: number
  }
  statusBreakdown: Array<{
    status: string
    count: number
    percentage: number
  }>
  typeBreakdown: Array<{
    type: string
    count: number
    avgProcessingTime: number
  }>
  dailyStats: Array<{
    date: string
    submitted: number
    approved: number
    rejected: number
    needsInfo: number
  }>
  rejectionReasons: Array<{
    reason: string
    count: number
  }>
  funnelData: {
    submitted: number
    underReview: number
    approved: number
    rejected: number
    needsInfo: number
  }
  slaMetrics: {
    avgProcessingTime: number
    sla24h: number
    sla48h: number
    sla72h: number
    totalProcessed: number
    sla24hRate: number
    sla48hRate: number
  }
  moderatorStats: Array<{
    userId: number
    name: string
    email: string
    actionsCount: number
  }>
  avgModerationTime: number
  totalModerationActions: number
}

interface ModerationAnalyticsClientProps {
  keySuffix?: string
}

export default function ModerationAnalyticsClient({ keySuffix = '' }: ModerationAnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [vendorType, setVendorType] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [period, vendorType, keySuffix])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // keySuffix уже содержит ?key=..., поэтому используем его как есть
      const url = `/api/admin/moderation-analytics?period=${period}&vendorType=${vendorType}${keySuffix.replace('?', '&')}`
      console.log('🔍 Fetching analytics from:', url)
      console.log('🔍 keySuffix:', keySuffix)
      console.log('🔍 period:', period, 'vendorType:', vendorType)
      const response = await fetch(url)
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const analyticsData = await response.json()
      console.log('✅ Analytics data received:', analyticsData)
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100'
      case 'REJECTED':
        return 'text-red-600 bg-red-100'
      case 'SUBMITTED':
        return 'text-blue-600 bg-blue-100'
      case 'NEEDS_INFO':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Одобрено'
      case 'REJECTED':
        return 'Отклонено'
      case 'SUBMITTED':
        return 'На рассмотрении'
      case 'NEEDS_INFO':
        return 'Требует информации'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'START':
        return 'START'
      case 'PRO':
        return 'PRO'
      default:
        return type
    }
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
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки данных</h2>
            <p className="text-gray-600">Не удалось загрузить аналитику модерации</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и фильтры */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Аналитика модерации</h1>
            <p className="text-gray-600">Статистика и отчеты по обработке заявок вендоров</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            {/* Фильтр периода */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Последние 7 дней</option>
              <option value="30d">Последние 30 дней</option>
              <option value="90d">Последние 90 дней</option>
              <option value="all">Все время</option>
            </select>

            {/* Фильтр типа вендора */}
            <select
              value={vendorType}
              onChange={(e) => setVendorType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все типы</option>
              <option value="START">START</option>
              <option value="PRO">PRO</option>
            </select>

            {/* Кнопка обновления */}
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

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего заявок</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.totalApplications}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Среднее время обработки</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.avgProcessingTime}ч</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Конверсия</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.conversionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA 24ч</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.sla24hRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Графики и детальная статистика */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Статусы заявок */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Статусы заявок</h3>
            <div className="space-y-4">
              {data.statusBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{item.count}</p>
                    <p className="text-sm text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Типы вендоров */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Типы вендоров</h3>
            <div className="space-y-4">
              {data.typeBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.type === 'PRO' 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {getTypeText(item.type)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{item.count}</p>
                    <p className="text-sm text-gray-500">~{item.avgProcessingTime}ч</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Воронка конверсии */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Воронка конверсии</h3>
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Подано</p>
              <p className="text-2xl font-bold text-gray-900">{data.funnelData.submitted}</p>
            </div>
            
            <div className="text-gray-400">→</div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">На рассмотрении</p>
              <p className="text-2xl font-bold text-gray-900">{data.funnelData.underReview}</p>
            </div>
            
            <div className="text-gray-400">→</div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Одобрено</p>
              <p className="text-2xl font-bold text-gray-900">{data.funnelData.approved}</p>
            </div>
            
            <div className="text-gray-400">→</div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Отклонено</p>
              <p className="text-2xl font-bold text-gray-900">{data.funnelData.rejected}</p>
            </div>
          </div>
        </div>

        {/* SLA метрики */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">SLA метрики</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{data.slaMetrics.sla24hRate}%</div>
              <p className="text-sm text-gray-600">Обработано за 24ч</p>
              <p className="text-xs text-gray-500">{data.slaMetrics.sla24h} из {data.slaMetrics.totalProcessed}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{data.slaMetrics.sla48hRate}%</div>
              <p className="text-sm text-gray-600">Обработано за 48ч</p>
              <p className="text-xs text-gray-500">{data.slaMetrics.sla48h} из {data.slaMetrics.totalProcessed}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{data.slaMetrics.avgProcessingTime}ч</div>
              <p className="text-sm text-gray-600">Среднее время</p>
              <p className="text-xs text-gray-500">Обработки заявки</p>
            </div>
          </div>
        </div>

        {/* Статистика по модераторам */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Активность модераторов</h3>
            <div className="space-y-4">
              {data.moderatorStats.map((moderator, index) => (
                <div key={moderator.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{moderator.name}</p>
                      <p className="text-sm text-gray-500">{moderator.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{moderator.actionsCount}</p>
                    <p className="text-sm text-gray-500">действий</p>
                  </div>
                </div>
              ))}
              {data.moderatorStats.length === 0 && (
                <p className="text-gray-500 text-center py-4">Нет данных о модераторах</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Время модерации</h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{data.avgModerationTime}ч</div>
                <p className="text-sm text-gray-600">Среднее время модерации</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{data.totalModerationActions}</div>
                <p className="text-sm text-gray-600">Всего действий модерации</p>
              </div>
            </div>
          </div>
        </div>

        {/* Топ причины отклонений */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Топ причины отклонений</h3>
          <div className="space-y-4">
            {data.rejectionReasons.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-900">{item.reason}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(item.count / data.rejectionReasons[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
