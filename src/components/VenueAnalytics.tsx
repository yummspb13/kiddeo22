'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Eye, MousePointer, Target, Clock, Globe } from 'lucide-react'

interface AnalyticsData {
  venue: {
    id: number
    name: string
    tariff: string
  }
  period: {
    from: string
    to: string
    days: number
  }
  summary: {
    totalViews: number
    totalClicks: number
    totalConversions: number
    avgTimeOnPage: number
    conversionRate: number
    clickThroughRate: number
  }
  trafficSources: Array<{
    source: string
    views: number
    clicks: number
    conversions: number
    percentage: number
  }>
  chartData: Array<{
    date: string
    views: number
    clicks: number
    conversions: number
    timeOnPage: number
  }>
}

interface VenueAnalyticsProps {
  venueId: number
  onUpgrade?: () => void
}

export default function VenueAnalytics({ venueId, onUpgrade }: VenueAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('7d')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  useEffect(() => {
    loadAnalytics()
    setCurrentPage(1) // Сбрасываем страницу при изменении периода
  }, [venueId, period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/public/venues/${venueId}/analytics?period=${period}`)
      
      if (response.status === 403) {
        const errorData = await response.json()
        setError(errorData.details || 'Analytics not available for your tariff')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to load analytics')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}с`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}м ${remainingSeconds}с`
  }

  // Пагинация для таблицы
  const totalPages = data ? Math.ceil(data.chartData.length / itemsPerPage) : 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data ? data.chartData.slice(startIndex, endIndex) : []

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Загрузка аналитики...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Аналитика недоступна
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Обновить тариф
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Аналитика</h3>
          <p className="text-sm text-gray-500">
            {data.period.days} дней
          </p>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Сегодня</option>
            <option value="yesterday">Вчера</option>
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <p className="ml-3 text-sm font-medium text-gray-600">Просмотры места</p>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(data.summary.totalViews)}
          </div>
          <div className="text-sm text-green-600 font-medium">
            +12.5% vs прошлый период
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <p className="ml-3 text-sm font-medium text-gray-600">Просмотры подкатегории</p>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(data.summary.totalViews * 0.3)}
          </div>
          <div className="text-sm text-green-600 font-medium">
            +8.2% vs прошлый период
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <p className="ml-3 text-sm font-medium text-gray-600">Конверсия</p>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {data.summary.conversionRate}%
          </div>
          <div className="text-sm text-red-600 font-medium">
            -2.1% vs прошлый период
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <p className="ml-3 text-sm font-medium text-gray-600">Время на странице</p>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatTime(data.summary.avgTimeOnPage)}
          </div>
          <div className="text-sm text-green-600 font-medium">
            +15.3% vs прошлый период
          </div>
        </div>
      </div>


      {/* Traffic Sources */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Источники трафика</h4>
        <div className="space-y-4">
          {data.trafficSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {source.source === 'direct' ? 'Прямые переходы' : source.source}
                  </p>
                  <p className="text-sm text-gray-500">
                    {source.views} просмотров • {source.clicks} кликов • {source.conversions} конверсий
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {source.percentage}%
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Data (Simple Table) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Детали по дням</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Просмотры
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клики
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Конверсии
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Время
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((day, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(day.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.clicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(day.timeOnPage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Показано {startIndex + 1}-{Math.min(endIndex, data.chartData.length)} из {data.chartData.length} записей
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
