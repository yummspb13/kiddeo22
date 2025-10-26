'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
// Убираем импорт шрифта, используем CSS переменную напрямую

export function CartButtonWithCounter() {
  const { state } = useCart()
  const [itemCount, setItemCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Функция для обновления счетчика
  const updateItemCount = () => {
    try {
      if (typeof window !== 'undefined') {
        // Используем данные из CartContext
        const totalItems = state.itemCount
        setItemCount(totalItems)
      }
    } catch (error) {
      console.error('Ошибка при загрузке количества товаров в корзине:', error)
    }
  }

  // Обновляем счетчик при изменении корзины
  useEffect(() => {
    updateItemCount()
    setIsLoading(false)
  }, [state.itemCount])

  if (isLoading) {
    return (
      <button className="relative p-2 rounded-full bg-transparent text-gray-700 hover:bg-gray-100 transition-all duration-300">
        <ShoppingCart className="w-6 h-6" />
      </button>
    )
  }

  return (
    <button 
      onClick={() => window.location.href = '/cart'}
      className="relative p-2 rounded-full bg-transparent text-gray-700 hover:bg-gray-100 transition-all duration-300 group"
    >
      <ShoppingCart className="w-6 h-6" />
      
      {/* Красный кругляшок с количеством товаров */}
      {itemCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse" style={{ fontFamily: 'var(--font-unbounded)' }}>
          {itemCount > 99 ? '99+' : itemCount}
        </div>
      )}
    </button>
  )
}
