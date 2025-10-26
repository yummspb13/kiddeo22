// src/app/admin/afisha/paid-events/page.tsx
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { DollarSign, Plus, Search, Filter, Edit, Trash2, Eye, TrendingUp, Users, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PaidEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  await requireAdminOrDevKey(sp)
  const k = await keySuffix(sp)

  // Моковые данные платных событий
  const mockPaidEvents = [
    {
      id: 1,
      title: 'Детский спектакль "Золушка"',
      date: '2024-01-15',
      time: '15:00',
      venue: 'Театр кукол',
      city: 'Москва',
      category: 'Театр',
      basePrice: 800,
      finalPrice: 800,
      capacity: 150,
      sold: 120,
      revenue: 96000,
      commission: 9600,
      status: 'active',
      organizer: 'Театр кукол им. Образцова',
      ticketTypes: [
        { name: 'Обычный', price: 800, sold: 100 },
        { name: 'VIP', price: 1200, sold: 20 }
      ]
    },
    {
      id: 2,
      title: 'Концерт детского хора',
      date: '2024-01-25',
      time: '18:00',
      venue: 'Концертный зал',
      city: 'СПб',
      category: 'Музыка',
      basePrice: 1200,
      finalPrice: 1200,
      capacity: 300,
      sold: 280,
      revenue: 336000,
      commission: 33600,
      status: 'active',
      organizer: 'Детская филармония',
      ticketTypes: [
        { name: 'Партер', price: 1200, sold: 200 },
        { name: 'Балкон', price: 800, sold: 80 }
      ]
    },
    {
      id: 3,
      title: 'Мастер-класс по живописи',
      date: '2024-02-01',
      time: '14:00',
      venue: 'Арт-студия "Палитра"',
      city: 'Москва',
      category: 'Мастер-класс',
      basePrice: 1500,
      finalPrice: 1500,
      capacity: 25,
      sold: 20,
      revenue: 30000,
      commission: 3000,
      status: 'active',
      organizer: 'Арт-студия "Палитра"',
      ticketTypes: [
        { name: 'Стандарт', price: 1500, sold: 20 }
      ]
    }
  ]

  const totalRevenue = mockPaidEvents.reduce((sum, event) => sum + event.revenue, 0)
  const totalCommission = mockPaidEvents.reduce((sum, event) => sum + event.commission, 0)
  const totalSold = mockPaidEvents.reduce((sum, event) => sum + event.sold, 0)
  const totalCapacity = mockPaidEvents.reduce((sum, event) => sum + event.capacity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Платные события</h1>
          <p className="text-sm text-gray-600">Управление платными событиями, билетами и ценами</p>
        </div>
        <Link
          href={`/admin/afisha/paid-events/create${k}`}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать платное событие
        </Link>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск платных событий..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="pending">На модерации</option>
            <option value="draft">Черновики</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Все города</option>
            <option value="moscow">Москва</option>
            <option value="spb">СПб</option>
          </select>

          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Все категории</option>
            <option value="theater">Театр</option>
            <option value="music">Музыка</option>
            <option value="workshop">Мастер-класс</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">₽{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Наша комиссия</p>
              <p className="text-2xl font-bold text-gray-900">₽{totalCommission.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Продано билетов</p>
              <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Заполняемость</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round((totalSold / totalCapacity) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица платных событий */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Платные события</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Событие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата/Время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Место
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена
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
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPaidEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.category} • {event.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.date}</div>
                    <div className="text-sm text-gray-500">{event.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {event.venue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₽{event.finalPrice}
                    </div>
                    <div className="text-sm text-gray-500">
                      от ₽{event.basePrice}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.sold}/{event.capacity}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                      ></div>
                    </div>
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
                    <div className="text-sm text-gray-500">
                      {Math.round((event.commission / event.revenue) * 100)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Детализация по типам билетов */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Детализация по типам билетов</h3>
        <div className="space-y-4">
          {mockPaidEvents.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <span className="text-sm text-gray-500">{event.date}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.ticketTypes.map((ticket, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{ticket.name}</span>
                      <span className="text-sm text-gray-600">₽{ticket.price}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Продано: {ticket.sold}</span>
                        <span>Выручка: ₽{(ticket.price * ticket.sold).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
