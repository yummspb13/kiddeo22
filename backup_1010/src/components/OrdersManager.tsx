'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Calendar, MapPin, CreditCard, Eye } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface OrderItem {
  id: string
  listing: {
    id: number
    title: string
    price: number
    currency: string
  }
  quantity: number
  price: number
}

interface Order {
  id: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
  OrderItem: OrderItem[]
}

interface OrdersManagerProps {
  onStatsUpdate?: () => void
}

export default function OrdersManager({ onStatsUpdate }: OrdersManagerProps) {
  const { user, loading: userLoading } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [ordersLoading, setOrdersLoading] = useState(false)

  console.log('🔍 OrdersManager - User:', user, 'UserLoading:', userLoading)

  useEffect(() => {
    console.log('🔍 OrdersManager useEffect - User:', user, 'UserLoading:', userLoading)
    if (user?.id) {
      console.log('🔍 OrdersManager - Fetching orders for user:', user.id)
      fetchOrders()
    } else if (!userLoading) {
      console.log('🔍 OrdersManager - No user ID after loading, setting loading to false')
      setLoading(false)
    }
  }, [user?.id, userLoading])

  // Отдельный эффект для загрузки заказов с пагинацией
  useEffect(() => {
    if (user?.id) {
      fetchOrdersPaginated()
    }
  }, [user?.id, currentPage])

  const fetchOrders = async () => {
    if (!user?.id) {
      console.log('🔍 fetchOrders - No user ID')
      return
    }

    console.log('🔍 fetchOrders - Starting fetch for user:', user.id)
    try {
      const response = await fetch('/api/profile/simple-orders', {
        headers: {
          'x-user-id': user.id
        }
      })
      console.log('🔍 fetchOrders - Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 fetchOrders - Data received:', data)
        setOrders(data.orders)
      } else {
        console.error('🔍 fetchOrders - Response not ok:', response.status)
      }
    } catch (error) {
      console.error('🔍 fetchOrders - Error:', error)
    } finally {
      console.log('🔍 fetchOrders - Setting loading to false')
      setLoading(false)
    }
  }

  const fetchOrdersPaginated = async () => {
    if (!user?.id) return

    setOrdersLoading(true)
    try {
      const response = await fetch(`/api/profile/orders?page=${currentPage}&limit=10`)
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
        setTotalOrders(data.totalOrders || 0)
      } else {
        const errorData = await response.json()
        console.error('Error fetching orders:', errorData)
        // Устанавливаем пустые значения при ошибке
        setOrders([])
        setTotalPages(1)
        setTotalOrders(0)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      // Устанавливаем пустые значения при ошибке
      setOrders([])
      setTotalPages(1)
      setTotalOrders(0)
    } finally {
      setOrdersLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'RUB'
    }).format(amount / 100)
  }

  if (userLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Пользователь не авторизован</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Список заказов */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Мои заказы</h3>
        <div className="text-sm text-gray-500">
          {totalOrders} заказов
        </div>
      </div>

      {ordersLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>У вас пока нет заказов</p>
          <p className="text-sm">Заказы появятся здесь после оформления</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Заказ #{order.id}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4" />
                        <span>{formatPrice(order.totalAmount, order.currency)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Товары в заказе */}
                <div className="space-y-2">
                  {order.OrderItem.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.listing.title}</h5>
                        <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.price, order.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
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
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
