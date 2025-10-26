// src/components/vendor/VendorOrderList.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  CreditCard,
  TrendingUp,
  DollarSign
} from "lucide-react"

interface Order {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED'
  totalAmount: number
  discountAmount: number
  finalAmount: number
  currency: string
  notes?: string
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  user: {
    id: number
    name?: string
    email: string
  }
  listing: {
    id: number
    title: string
    slug: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    ticketType: {
      id: number
      name: string
    }
  }>
  payments: Array<{
    id: number
    status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'CANCELED' | 'FAILED' | 'REFUNDED'
    amount: number
    paidAt?: Date
  }>
}

interface VendorOrderListProps {
  vendorId: number
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  PENDING: 'Ожидает оплаты',
  CONFIRMED: 'Подтвержден',
  PAID: 'Оплачен',
  CANCELLED: 'Отменен',
  REFUNDED: 'Возвращен',
  EXPIRED: 'Истек'
}

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PAID: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: XCircle,
  EXPIRED: Clock
}

export default function VendorOrderList({ vendorId }: VendorOrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [vendorId])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders?type=vendor&limit=50')
      if (!response.ok) {
        throw new Error('Ошибка загрузки заказов')
      }
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/orders/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
    }
  }

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock
    return <Icon className="w-4 h-4" />
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason })
      })

      if (response.ok) {
        await loadOrders()
        await loadStats()
      }
    } catch (error) {
      console.error('Ошибка отмены заказа:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadOrders}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Всего заказов</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Оплаченных</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.paidOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Выручка</p>
              <p className="text-2xl font-semibold text-gray-900">{formatPrice(stats.totalRevenue)} ₽</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Средний чек</p>
              <p className="text-2xl font-semibold text-gray-900">{formatPrice(stats.avgOrderValue)} ₽</p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Фильтр:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все заказы</option>
            <option value="PENDING">Ожидают оплаты</option>
            <option value="PAID">Оплаченные</option>
            <option value="CONFIRMED">Подтвержденные</option>
            <option value="CANCELLED">Отмененные</option>
          </select>
        </div>
      </div>

      {/* Список заказов */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Заказов пока нет</h3>
            <p className="text-gray-600">Заказы появятся здесь, когда клиенты начнут покупать ваши билеты</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Заказ #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{STATUS_LABELS[order.status]}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.listing.title}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{order.user.name || order.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPrice(order.finalAmount)} ₽
                  </p>
                  {order.discountAmount > 0 && (
                    <p className="text-sm text-green-600">
                      Скидка: {formatPrice(order.discountAmount)} ₽
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Заказанные билеты:</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {item.ticketType.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.totalPrice)} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => console.log('Просмотр заказа:', order.id)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Подробнее</span>
                  </button>
                  
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Причина отмены заказа:')
                        if (reason) {
                          handleCancelOrder(order.id, reason)
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Отменить
                    </button>
                  )}
                </div>

                {order.status === 'PENDING' && order.expiresAt && (
                  <div className="text-sm text-orange-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Истекает: {formatDate(order.expiresAt)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
