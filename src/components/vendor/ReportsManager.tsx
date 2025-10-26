// src/components/vendor/ReportsManager.tsx
"use client"

import { useState } from "react"
import { 
  Download, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Filter
} from "lucide-react"

interface ReportData {
  period: string
  totalViews: number
  totalClicks: number
  totalBookings: number
  totalRevenue: number
  conversionRate: number
  topListings: Array<{
    id: number
    title: string
    views: number
    bookings: number
    revenue: number
  }>
  dailyStats: Array<{
    date: string
    views: number
    bookings: number
    revenue: number
  }>
}

interface ReportsManagerProps {
  data: ReportData
  onExport: (format: 'csv' | 'xlsx' | 'pdf', period: string) => void
}

export default function ReportsManager({ data, onExport }: ReportsManagerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv')
  const [showFilters, setShowFilters] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleExport = () => {
    onExport(selectedFormat, selectedPeriod)
  }

  const periods = [
    { value: '7d', label: '7 дней' },
    { value: '30d', label: '30 дней' },
    { value: '90d', label: '90 дней' },
    { value: '1y', label: '1 год' }
  ]

  const formats = [
    { value: 'csv', label: 'CSV', description: 'Для Excel и Google Sheets' },
    { value: 'xlsx', label: 'Excel', description: 'Файл Excel с форматированием' },
    { value: 'pdf', label: 'PDF', description: 'Отчет для печати' }
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок и экспорт */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Отчеты и аналитика</h2>
          <p className="text-gray-600">Детальная аналитика и экспорт данных</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {formats.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Просмотры</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Клики</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Бронирования</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalBookings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Выручка</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Конверсия */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Конверсия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Просмотры → Клики</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPercentage((data.totalClicks / data.totalViews) * 100)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Клики → Бронирования</p>
            <p className="text-2xl font-bold text-green-600">
              {formatPercentage((data.totalBookings / data.totalClicks) * 100)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Общая конверсия</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatPercentage(data.conversionRate)}
            </p>
          </div>
        </div>
      </div>

      {/* Топ объявления */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ объявления</h3>
        <div className="space-y-4">
          {data.topListings.map((listing, index) => (
            <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{listing.title}</h4>
                  <p className="text-sm text-gray-600">
                    {listing.views} просмотров • {listing.bookings} бронирований
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(listing.revenue)}</p>
                <p className="text-sm text-gray-600">
                  {formatPercentage((listing.bookings / listing.views) * 100)} конверсия
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ежедневная статистика */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ежедневная статистика</h3>
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
                  Бронирования
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Выручка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Конверсия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.dailyStats.map((stat, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(stat.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.bookings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(stat.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage((stat.bookings / stat.views) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Дополнительные отчеты */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Финансовый отчет</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Общая выручка</span>
              <span className="font-medium">{formatCurrency(data.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Комиссия платформы</span>
              <span className="font-medium">{formatCurrency(data.totalRevenue * 0.1)}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-900 font-medium">К выплате</span>
              <span className="font-bold text-green-600">{formatCurrency(data.totalRevenue * 0.9)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Экспорт данных</h3>
          <div className="space-y-3">
            <button
              onClick={() => onExport('csv', selectedPeriod)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Экспорт в CSV
            </button>
            <button
              onClick={() => onExport('xlsx', selectedPeriod)}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Экспорт в Excel
            </button>
            <button
              onClick={() => onExport('pdf', selectedPeriod)}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Экспорт в PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
