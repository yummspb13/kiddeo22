// src/components/orders/Cart.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Tag,
  Gift,
  X
} from "lucide-react"

interface CartItem {
  ticketTypeId: number
  name: string
  price: number
  quantity: number
  maxQuantity?: number
}

interface CartProps {
  listingId: number
  vendorId: number
  onCheckout: (items: CartItem[], promoCode?: string, loyaltyPoints?: number) => void
}

export default function Cart({ listingId, vendorId, onCheckout }: CartProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [availablePoints, setAvailablePoints] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadLoyaltyPoints()
  }, [])

  const loadLoyaltyPoints = async () => {
    try {
      const response = await fetch('/api/loyalty?type=stats')
      if (response.ok) {
        const data = await response.json()
        setAvailablePoints(data.balance || 0)
      }
    } catch (error) {
      console.error('Ошибка загрузки баллов:', error)
    }
  }

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.ticketTypeId === item.ticketTypeId)
      if (existing) {
        if (existing.maxQuantity && existing.quantity >= existing.maxQuantity) {
          return prev
        }
        return prev.map(i => 
          i.ticketTypeId === item.ticketTypeId 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (ticketTypeId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(ticketTypeId)
      return
    }

    setItems(prev => prev.map(item => 
      item.ticketTypeId === ticketTypeId 
        ? { ...item, quantity: Math.min(quantity, item.maxQuantity || Infinity) }
        : item
    ))
  }

  const removeItem = (ticketTypeId: number) => {
    setItems(prev => prev.filter(item => item.ticketTypeId !== ticketTypeId))
  }

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return

    try {
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0)
      const response = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderAmount: totalAmount })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          setDiscount(data.discount)
        } else {
          alert('Промокод недействителен')
        }
      }
    } catch (error) {
      console.error('Ошибка применения промокода:', error)
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity * 100), 0)
    const loyaltyDiscount = Math.min(loyaltyPoints * 10, subtotal) // 1 балл = 10 копеек
    const total = Math.max(0, subtotal - discount - loyaltyDiscount)
    return { subtotal, discount: discount + loyaltyDiscount, total }
  }

  const handleCheckout = async () => {
    if (items.length === 0) return

    setLoading(true)
    try {
      await onCheckout(items, promoCode || undefined, loyaltyPoints || undefined)
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, discount: totalDiscount, total } = calculateTotal()

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Корзина пуста</h3>
        <p className="text-gray-600">Добавьте билеты для покупки</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Корзина</h3>
        <span className="text-sm text-gray-500">{items.length} товаров</span>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.ticketTypeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <p className="text-sm text-gray-600">{(item.price / 100).toFixed(2)} ₽ за шт.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                  className="p-1 rounded-md hover:bg-gray-200"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                  className="p-1 rounded-md hover:bg-gray-200"
                  disabled={!!(item.maxQuantity && item.quantity >= item.maxQuantity)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <span className="font-medium text-gray-900 w-20 text-right">
                {((item.price * item.quantity) / 100).toFixed(2)} ₽
              </span>
              
              <button
                onClick={() => removeItem(item.ticketTypeId)}
                className="p-1 text-red-600 hover:bg-red-100 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Промокод */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Промокод"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyPromoCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Применить
          </button>
        </div>
      </div>

      {/* Баллы лояльности */}
      {availablePoints > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Баллы лояльности: {availablePoints} (1 балл = 10 копеек)
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max={availablePoints}
              value={loyaltyPoints}
              onChange={(e) => setLoyaltyPoints(Math.min(parseInt(e.target.value) || 0, availablePoints))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">баллов</span>
          </div>
        </div>
      )}

      {/* Итого */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Промежуточный итог:</span>
          <span>{(subtotal / 100).toFixed(2)} ₽</span>
        </div>
        
        {totalDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Скидка:</span>
            <span>-{(totalDiscount / 100).toFixed(2)} ₽</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Итого:</span>
          <span>{(total / 100).toFixed(2)} ₽</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || total <= 0}
        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <CreditCard className="w-5 h-5" />
        <span>{loading ? 'Обработка...' : 'Оформить заказ'}</span>
      </button>
    </div>
  )
}
