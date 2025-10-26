// src/components/vendor/SalesAnalytics.tsx
"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Eye, MousePointer, ShoppingCart, CreditCard, Download } from "lucide-react"

interface AnalyticsData {
  period: string
  views: number
  clicks: number
  bookings: number
  revenue: number
  conversion: {
    viewsToClicks: number
    clicksToBookings: number
    bookingsToRevenue: number
  }
  topListings: Array<{
    id: number
    title: string
    views: number
    bookings: number
    revenue: number
  }>
}

interface SalesAnalyticsProps {
  data: AnalyticsData
  onExport: () => void
}

export default function SalesAnalytics({ data, onExport }: SalesAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

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

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и экспорт */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Аналитика продаж</h2>
          <p className="text-gray-600">Отслеживайте эффективность ваших объявлений</p>
        </div>
        <button
          onClick={onExport}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Экспорт CSV
        </button>
      </div>

      {/* Период */}
      <div className="flex space-x-2">
        {['7d', '30d', '90d'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period === '7d' ? '7 дней' : period === '30d' ? '30 дней' : '90 дней'}
          </button>
        ))}
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Просмотры */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Просмотры</p>
              <p className="text-2xl font-bold text-gray-900">{data.views.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Клики */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Клики</p>
              <p className="text-2xl font-bold text-gray-900">{data.clicks.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MousePointer className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Бронирования */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Бронирования</p>
              <p className="text-2xl font-bold text-gray-900">{data.bookings.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Выручка */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Выручка</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Воронка конверсии */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Воронка конверсии</h3>
        <div className="space-y-4">
          {/* Просмотры → Клики */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Просмотры → Клики</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-2">
                {formatPercentage(data.conversion.viewsToClicks)}
              </span>
              {getTrendIcon(data.conversion.viewsToClicks, 0)}
            </div>
          </div>

          {/* Клики → Бронирования */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <MousePointer className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Клики → Бронирования</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-2">
                {formatPercentage(data.conversion.clicksToBookings)}
              </span>
              {getTrendIcon(data.conversion.clicksToBookings, 0)}
            </div>
          </div>

          {/* Бронирования → Выручка */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <ShoppingCart className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Бронирования → Выручка</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 mr-2">
                {formatPercentage(data.conversion.bookingsToRevenue)}
              </span>
              {getTrendIcon(data.conversion.bookingsToRevenue, 0)}
            </div>
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
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
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
    </div>
  )
}
