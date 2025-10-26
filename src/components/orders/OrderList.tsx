// src/components/orders/OrderList.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download,
  Eye,
  Calendar,
  MapPin,
  CreditCard
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
  vendor: {
    id: number
    displayName: string
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
  tickets: Array<{
    id: string
    qrCode: string
    status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED'
    usedAt?: Date
  }>
}

interface OrderListProps {
  userId: number
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

export default function OrderList({ userId }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [userId])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders?type=user&limit=50')
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

  const handleDownloadTickets = async (orderId: string) => {
    // TODO: Реализовать скачивание билетов
    console.log('Скачивание билетов для заказа:', orderId)
  }

  const handleViewOrder = (orderId: string) => {
    // TODO: Реализовать просмотр деталей заказа
    console.log('Просмотр заказа:', orderId)
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">У вас пока нет заказов</h3>
        <p className="text-gray-600">Начните с покупки билетов на интересные события!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Мои заказы</h2>
        <span className="text-sm text-gray-500">{orders.length} заказов</span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
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
                  {order.listing.title} • {order.vendor.displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
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

            {order.tickets.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Билеты:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {order.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">{ticket.qrCode}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'USED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status === 'ACTIVE' ? 'Активен' :
                         ticket.status === 'USED' ? 'Использован' : 'Отменен'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewOrder(order.id)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Подробнее</span>
                </button>
                
                {order.tickets.length > 0 && (
                  <button
                    onClick={() => handleDownloadTickets(order.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Билеты</span>
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
        ))}
      </div>
    </div>
  )
}
