'use client'

import React, { useMemo, useState } from 'react'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'
import Link from 'next/link'

type TicketItem = {
  id: string | number
  name: string
  price: number
  description?: string
}

type PaymentMethod = 'card' | 'sbp'

export type TicketCalculatorProps = {
  tickets: TicketItem[]
  buyUrl?: string
  onCheckout?: (order: { ticketId: string | number; quantity: number }[], total: number) => void
  onAddToCart?: (order: { ticketId: string | number; quantity: number }[], total: number) => void
  onQuickCheckout?: (order: { ticketId: string | number; quantity: number }[], total: number, paymentMethod: PaymentMethod) => void
  onQuantityChange?: (ticketId: string | number, quantity: number) => void
  className?: string
  hideCheckoutButton?: boolean
  initialQuantities?: Record<string | number, number>
  isInCart?: boolean
}

function formatRub(amount: number) {
  return `${Math.round(amount).toLocaleString('ru-RU')} ₽`
}

export default function TicketCalculator({ tickets, buyUrl, onCheckout, onAddToCart, onQuickCheckout, onQuantityChange, className, hideCheckoutButton, initialQuantities = {}, isInCart = false }: TicketCalculatorProps) {
  const { user } = useAuthBridge()
  const [localQuantities, setLocalQuantities] = useState<Record<string | number, number>>(() => initialQuantities || {})
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card')

  // Используем initialQuantities как источник истины, но позволяем локальные изменения
  const currentQuantities = React.useMemo(() => {
    // Если есть локальные изменения, используем их, иначе используем initialQuantities
    const hasLocalChanges = Object.keys(localQuantities).some(key => 
      localQuantities[key] !== ((initialQuantities && initialQuantities[key]) || 0)
    )
    
    if (hasLocalChanges) {
      return localQuantities
    }
    
    return initialQuantities || {}
  }, [initialQuantities, localQuantities])

  const items = useMemo(() => (tickets || []).map(t => ({ ...t, priceNum: Number.isFinite(t.price) ? t.price : 0 })), [tickets])

  const summary = useMemo(() => {
    const lines: { id: string | number; name: string; qty: number; sum: number }[] = []
    let total = 0
    for (const t of items) {
      const q = currentQuantities[t.id] || 0
      if (q > 0) {
        const sum = q * t.price
        total += sum
        lines.push({ id: t.id, name: t.name || 'Билет', qty: q, sum })
      }
    }
    return { lines, total }
  }, [items, currentQuantities])

  // Подсчитываем общее количество билетов в корзине
  const totalTicketsInCart = Object.values(currentQuantities).reduce((sum, qty) => sum + qty, 0)

  const inc = (id: string | number) => {
    const newQuantity = (currentQuantities[id] || 0) + 1
    setLocalQuantities(s => ({ ...s, [id]: newQuantity }))
    onQuantityChange?.(id, newQuantity)
  }
  const dec = (id: string | number) => {
    const newQuantity = Math.max(0, (currentQuantities[id] || 0) - 1)
    setLocalQuantities(s => ({ ...s, [id]: newQuantity }))
    onQuantityChange?.(id, newQuantity)
  }
  const set = (id: string | number, v: number) => {
    const newQuantity = Math.max(0, Math.floor(v || 0))
    setLocalQuantities(s => ({ ...s, [id]: newQuantity }))
    onQuantityChange?.(id, newQuantity)
  }

  const handleCheckout = () => {
    const order = Object.entries(currentQuantities)
      .map(([ticketId, quantity]) => ({ ticketId, quantity }))
      .filter(x => x.quantity > 0)
    onCheckout?.(order, summary.total)
    if (buyUrl) {
      window.open(buyUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleAddToCart = () => {
    const order = Object.entries(currentQuantities)
      .map(([ticketId, quantity]) => ({ ticketId, quantity }))
      .filter(x => x.quantity > 0)
    onAddToCart?.(order, summary.total)
  }

  const handleQuickCheckout = () => {
    setShowPaymentMethods(true)
  }

  const handlePayment = () => {
    const order = Object.entries(currentQuantities)
      .map(([ticketId, quantity]) => ({ ticketId, quantity }))
      .filter(x => x.quantity > 0)
    onQuickCheckout?.(order, summary.total, selectedPaymentMethod)
  }

  // Вычисляем количество баллов (примерно 1% от суммы)
  const points = Math.floor(summary.total * 0.01)

  return (
    <div className={className}>
      <div className="space-y-3">
        {items.map((t, idx) => (
          <div key={t.id ?? idx} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800 line-clamp-1 font-unbounded">{t.name || `Тариф ${idx + 1}`}</div>
              {typeof t.price === 'number' && t.price === 0 ? (
                <div className="text-xs text-emerald-600 font-unbounded">Бесплатно</div>
              ) : (
                <div className="text-xs text-gray-500 font-unbounded">{formatRub(t.price)}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-8 w-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-unbounded"
                onClick={() => dec(t.id)}
                aria-label="Уменьшить"
              >
                −
              </button>
              <input
                inputMode="numeric"
                value={currentQuantities[t.id] || 0}
                onChange={(e) => set(t.id, Number(e.target.value.replace(/\D+/g, '')))}
                className="w-12 text-center h-8 rounded-lg border border-gray-300 font-unbounded"
              />
              <button
                type="button"
                className="h-8 w-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-unbounded"
                onClick={() => inc(t.id)}
                aria-label="Увеличить"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="my-4 h-px bg-gray-200" />

      {summary.lines.length > 0 ? (
        <div className="space-y-1 text-sm">
          {summary.lines.map((l) => (
            <div key={l.id} className="flex items-center justify-between">
              <div className="text-gray-700 line-clamp-1 font-unbounded">{l.name} ×{l.qty}</div>
              <div className="font-semibold font-unbounded">{formatRub(l.sum)}</div>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-gray-200 font-semibold">
            <div className="font-unbounded">Итого</div>
            <div className="font-unbounded">{formatRub(summary.total)}</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 font-unbounded">Выберите количество билетов</div>
      )}

      {!hideCheckoutButton && (
        <div className="mt-4 space-y-3">
           {/* Две основные кнопки */}
           <div className="grid grid-cols-2 gap-3">
             {isInCart ? (
               <Link
                 href="/cart"
                 className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold font-unbounded bg-green-500 text-white hover:bg-green-600 transition-colors"
               >
                 В корзине ({totalTicketsInCart})
               </Link>
             ) : (
               <button
                 type="button"
                 onClick={handleAddToCart}
                 disabled={summary.total <= 0}
                 className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold font-unbounded ${
                   summary.total > 0 
                     ? 'bg-red-500 text-white hover:bg-red-600' 
                     : 'bg-red-300 text-white cursor-not-allowed'
                 }`}
               >
                 Добавить в корзину
               </button>
             )}
            <button
              type="button"
              onClick={handleQuickCheckout}
              disabled={summary.total <= 0}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold font-unbounded ${
                summary.total > 0 ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-yellow-200 text-black cursor-not-allowed'
              }`}
            >
              Оформить в 1 клик
            </button>
          </div>

          {/* Информация о баллах */}
          {summary.total > 0 && (
            <div className="text-xs text-gray-500 font-unbounded">
              {user ? (
                `Зачислится ${points} баллов`
              ) : (
                `Войдите, чтобы ${points} баллов зачислились`
              )}
            </div>
          )}

          {/* Способы оплаты (показывается при нажатии на "Оформить в 1 клик") */}
          {showPaymentMethods && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 font-unbounded">Способы оплаты:</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                    className="text-red-500"
                  />
                  <span className="text-sm text-gray-700 font-unbounded">Банковская карта</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="sbp"
                    checked={selectedPaymentMethod === 'sbp'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                    className="text-red-500"
                  />
                  <span className="text-sm text-gray-700 font-unbounded">СБП</span>
                </label>
              </div>
              <button
                type="button"
                onClick={handlePayment}
                className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold font-unbounded bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Оплатить сейчас
              </button>
            </div>
          )}

          <div className="text-xs text-gray-500 font-unbounded">Количество мест ограничено. Оплата защищена.</div>
        </div>
      )}
    </div>
  )
}


