"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, CreditCard, Download, Eye, Star } from "lucide-react"

interface Order {
  id: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  eventTitle: string
  eventDate: string
  venue: string
  total: number
  tickets: number
  createdAt: string
  qrCode?: string
}

interface OrdersClientProps {
  userId: string
}

export default function OrdersClient({ userId }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled" | "completed">("all")

  // Заглушка для демонстрации
  useEffect(() => {
    setOrders([
      {
        id: "ORD-001",
        status: "confirmed",
        eventTitle: "Мастер-класс по рисованию",
        eventDate: "2024-09-15T15:00:00",
        venue: "Детский центр \"Радуга\"",
        total: 1500,
        tickets: 2,
        createdAt: "2024-09-10T10:30:00",
        qrCode: "QR123456"
      },
      {
        id: "ORD-002", 
        status: "pending",
        eventTitle: "Спортивная секция",
        eventDate: "2024-09-20T17:00:00",
        venue: "Спорткомплекс \"Олимп\"",
        total: 2000,
        tickets: 1,
        createdAt: "2024-09-12T14:20:00"
      },
      {
        id: "ORD-003",
        status: "completed",
        eventTitle: "Концерт детской музыки",
        eventDate: "2024-09-05T18:00:00",
        venue: "Концертный зал",
        total: 800,
        tickets: 3,
        createdAt: "2024-09-01T09:15:00"
      }
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Ожидает подтверждения"
      case "confirmed":
        return "Подтвержден"
      case "cancelled":
        return "Отменен"
      case "completed":
        return "Завершен"
      default:
        return status
    }
  }

  const filteredOrders = orders.filter(order => 
    filter === "all" || order.status === filter
  )

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 profile-card-mobile md:bg-white md:rounded-lg md:shadow-sm md:p-4 md:sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0 profile-flex-mobile profile-flex-col-mobile md:flex-col md:sm:flex-row md:sm:items-center md:justify-between md:mb-4 md:sm:mb-6 md:space-y-2 md:sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 profile-text-xl-mobile md:text-xl md:sm:text-2xl">Мои заказы</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base profile-text-sm-mobile md:text-sm md:sm:text-base">
            Управляйте своими заказами и билетами
          </p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 profile-text-xs-mobile md:text-xs md:sm:text-sm">
          Всего заказов: {orders.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {[
              { key: "all", label: "Все заказы" },
              { key: "pending", label: "Ожидают" },
              { key: "confirmed", label: "Подтверждены" },
              { key: "completed", label: "Завершены" },
              { key: "cancelled", label: "Отменены" }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as "all" | "pending" | "confirmed" | "cancelled" | "completed")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Заказов не найдено</h3>
              <p className="text-sm sm:text-base text-gray-500">
                {filter === "all" 
                  ? "У вас пока нет заказов"
                  : `Нет заказов со статусом "${getStatusText(filter)}"`
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{order.eventTitle}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} w-fit`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{new Date(order.eventDate).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{order.venue}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{order.total} ₽</div>
                    <div className="text-xs sm:text-sm text-gray-500">{order.tickets} билетов</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 space-y-2 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Заказ от {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {order.qrCode && (
                      <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs sm:text-sm">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Скачать QR</span>
                      </button>
                    )}
                    <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-xs sm:text-sm">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Подробнее</span>
                    </button>
                    {order.status === "completed" && (
                      <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs sm:text-sm">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Оценить</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Статистика заказов</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Всего заказов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {orders.filter(o => o.status === "completed").length}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                {orders.filter(o => o.status === "pending" || o.status === "confirmed").length}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Активных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {orders.reduce((sum, order) => sum + order.total, 0)} ₽
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Потрачено</div>
            </div>
          </div>
        </div>
    </div>
  )
}
