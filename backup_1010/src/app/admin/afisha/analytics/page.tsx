// src/app/admin/afisha/analytics/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { BarChart3, TrendingUp, Users, Eye, Calendar, Download, Filter, PieChart, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AfishaAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  // Моковые данные аналитики
  const mockAnalytics = {
    overview: {
      totalViews: 152000,
      uniqueVisitors: 45000,
      avgSessionDuration: '3:24',
      bounceRate: 35.2,
      conversionRate: 8.5
    },
    popularEvents: [
      { name: 'Детский спектакль "Золушка"', views: 12500, clicks: 850, conversion: 6.8 },
      { name: 'Концерт детского хора', views: 9800, clicks: 720, conversion: 7.3 },
      { name: 'Мастер-класс по живописи', views: 7600, clicks: 450, conversion: 5.9 },
      { name: 'Спортивная олимпиада', views: 6800, clicks: 380, conversion: 5.6 },
      { name: 'Выставка детских работ', views: 5400, clicks: 320, conversion: 5.9 }
    ],
    trafficSources: [
      { source: 'Поиск Google', visitors: 18000, percentage: 40 },
      { source: 'Социальные сети', visitors: 13500, percentage: 30 },
      { source: 'Прямые переходы', visitors: 9000, percentage: 20 },
      { source: 'Реклама', visitors: 4500, percentage: 10 }
    ],
    deviceStats: [
      { device: 'Мобильные', visitors: 27000, percentage: 60 },
      { device: 'Десктоп', visitors: 13500, percentage: 30 },
      { device: 'Планшеты', visitors: 4500, percentage: 10 }
    ],
    timeStats: [
      { hour: '09:00', visitors: 1200 },
      { hour: '10:00', visitors: 1800 },
      { hour: '11:00', visitors: 2200 },
      { hour: '12:00', visitors: 2500 },
      { hour: '13:00', visitors: 2000 },
      { hour: '14:00', visitors: 1800 },
      { hour: '15:00', visitors: 1600 },
      { hour: '16:00', visitors: 1400 },
      { hour: '17:00', visitors: 1200 },
      { hour: '18:00', visitors: 1000 },
      { hour: '19:00', visitors: 800 },
      { hour: '20:00', visitors: 600 }
    ],
    categoryStats: [
      { category: 'Театр', events: 25, views: 45000, avgViews: 1800 },
      { category: 'Музыка', events: 18, views: 38000, avgViews: 2111 },
      { category: 'Спорт', events: 22, views: 32000, avgViews: 1455 },
      { category: 'Мастер-классы', events: 15, views: 25000, avgViews: 1667 },
      { category: 'Выставки', events: 9, views: 12000, avgViews: 1333 }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика афиши</h1>
          <p className="text-sm text-gray-600">Детальная аналитика посещений, популярности событий и поведения пользователей</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Download className="w-4 h-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Просмотры</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Уникальные посетители</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Время на сайте</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.avgSessionDuration}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Показатель отказов</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.bounceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Конверсия</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График посещений по времени */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Посещения по времени суток</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">График посещений по часам</p>
              <p className="text-sm text-gray-400">Пик посещений: 12:00-13:00 ({Math.max(...mockAnalytics.timeStats.map(s => s.visitors))} посетителей)</p>
            </div>
          </div>
        </div>

        {/* Источники трафика */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Источники трафика</h3>
          <div className="space-y-3">
            {mockAnalytics.trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm text-gray-900">{source.source}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{source.visitors.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{source.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Популярные события */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные события</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Событие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Просмотры
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клики
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Конверсия
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Эффективность
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockAnalytics.popularEvents.map((event, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.clicks.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.conversion}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(event.conversion / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {event.conversion > 7 ? 'Высокая' : event.conversion > 5 ? 'Средняя' : 'Низкая'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Статистика по устройствам и категориям */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Устройства */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Устройства</h3>
          <div className="space-y-4">
            {mockAnalytics.deviceStats.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm text-gray-900">{device.device}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{device.visitors.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{device.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Категории */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по категориям</h3>
          <div className="space-y-3">
            {mockAnalytics.categoryStats.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{category.category}</p>
                  <p className="text-xs text-gray-500">{category.events} событий</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{category.views.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">~{category.avgViews} просмотров/событие</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Круговая диаграмма */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение трафика</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Круговая диаграмма источников трафика</p>
            <p className="text-sm text-gray-400">Здесь будет отображаться визуализация данных о трафике</p>
          </div>
        </div>
      </div>
    </div>
  )
}
