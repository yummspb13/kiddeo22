// src/app/admin/afisha/finance/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { TrendingUp, DollarSign, Users, Calendar, Download, Filter, BarChart3, PieChart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AfishaFinancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  // Моковые данные финансов
  const mockFinanceData = {
    totalRevenue: 2450000,
    totalCommission: 245000,
    totalTicketsSold: 15200,
    totalEvents: 89,
    monthlyData: [
      { month: 'Янв', revenue: 180000, commission: 18000, tickets: 1200 },
      { month: 'Фев', revenue: 220000, commission: 22000, tickets: 1400 },
      { month: 'Мар', revenue: 280000, commission: 28000, tickets: 1800 },
      { month: 'Апр', revenue: 320000, commission: 32000, tickets: 2100 },
      { month: 'Май', revenue: 380000, commission: 38000, tickets: 2500 },
      { month: 'Июн', revenue: 450000, commission: 45000, tickets: 3000 },
      { month: 'Июл', revenue: 520000, commission: 52000, tickets: 3500 }
    ],
    topEvents: [
      { name: 'Детский спектакль "Золушка"', revenue: 96000, tickets: 120, commission: 9600 },
      { name: 'Концерт детского хора', revenue: 336000, tickets: 280, commission: 33600 },
      { name: 'Мастер-класс по живописи', revenue: 30000, tickets: 20, commission: 3000 },
      { name: 'Спортивная олимпиада', revenue: 0, tickets: 450, commission: 0 },
      { name: 'Выставка детских работ', revenue: 45000, tickets: 150, commission: 4500 }
    ],
    cityStats: [
      { city: 'Москва', revenue: 1800000, commission: 180000, events: 65 },
      { city: 'СПб', revenue: 650000, commission: 65000, events: 24 }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Финансы афиши</h1>
          <p className="text-sm text-gray-600">Статистика продаж билетов, комиссии и доходы</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="w-4 h-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">₽{mockFinanceData.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Наша комиссия</p>
              <p className="text-2xl font-bold text-gray-900">₽{mockFinanceData.totalCommission.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Продано билетов</p>
              <p className="text-2xl font-bold text-gray-900">{mockFinanceData.totalTicketsSold.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Платных событий</p>
              <p className="text-2xl font-bold text-gray-900">{mockFinanceData.totalEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* График доходов по месяцам */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Динамика доходов</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">График доходов по месяцам</p>
            <p className="text-sm text-gray-400">Здесь будет отображаться график с данными: {JSON.stringify(mockFinanceData.monthlyData.slice(0, 3))}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ событий по доходу */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ событий по доходу</h3>
          <div className="space-y-3">
            {mockFinanceData.topEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.name}</p>
                  <p className="text-xs text-gray-500">{event.tickets} билетов</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₽{event.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">₽{event.commission.toLocaleString()} комиссия</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика по городам */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по городам</h3>
          <div className="space-y-4">
            {mockFinanceData.cityStats.map((city, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{city.city}</p>
                  <p className="text-xs text-gray-500">{city.events} событий</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₽{city.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">₽{city.commission.toLocaleString()} комиссия</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Детальная таблица */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Детальная финансовая отчетность</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Событие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Город
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Билеты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Выручка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Комиссия
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockFinanceData.topEvents.map((event, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {index % 2 === 0 ? 'Москва' : 'СПб'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.tickets}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₽{event.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      ₽{event.commission.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.revenue > 0 ? Math.round((event.commission / event.revenue) * 100) : 0}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Круговая диаграмма */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение доходов</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Круговая диаграмма доходов</p>
            <p className="text-sm text-gray-400">Здесь будет отображаться распределение доходов по категориям</p>
          </div>
        </div>
      </div>
    </div>
  )
}
