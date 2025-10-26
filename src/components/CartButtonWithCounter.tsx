'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
// Убираем импорт шрифта, используем CSS переменную напрямую

export function CartButtonWithCounter() {
  const { state } = useCart()
  const [isLoading, setIsLoading] = useState(true)

  // Обновляем счетчик при изменении корзины
  useEffect(() => {
    setIsLoading(false)
    // Принудительно обновляем счетчик при изменении корзины
  }, [state.itemCount])

  if (isLoading) {
    return (
      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <ShoppingCart size={20} />
      </button>
    )
  }

  return (
    <button 
      onClick={() => window.location.href = '/cart'}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group"
    >
      <ShoppingCart size={20} />
      
      {/* Красный кругляшок с количеством товаров */}
      {state.itemCount > 0 && (
        <div 
          key={`cart-count-${state.itemCount}`} // Принудительное обновление при изменении
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse" 
          style={{ fontFamily: 'var(--font-unbounded)' }}
        >
          {state.itemCount > 99 ? '99+' : state.itemCount}
        </div>
      )}
    </button>
  )
}
