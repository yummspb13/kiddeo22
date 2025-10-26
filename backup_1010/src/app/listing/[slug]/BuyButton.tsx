// src/app/listing/[slug]/BuyButton.tsx
'use client'

import { useState } from 'react'

type Props = {
  listingId: number
  // для афиши (режим A) нужен выбранный тип билета
  ticketTypeId?: number
  qty?: number
  returnUrl?: string
}

export default function BuyButton({
  listingId,
  ticketTypeId,
  qty = 1,
  returnUrl,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pay/yookassa/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          ticketTypeId,
          qty,
          returnUrl:
            returnUrl ??
            (typeof window !== 'undefined' ? window.location.href : '/'),
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `HTTP ${res.status}`)
      }

      const data: { paymentUrl?: string } = await res.json()
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        throw new Error('Не получили ссылку на оплату')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Неизвестная ошибка'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-lg px-4 py-2 font-medium bg-black text-white disabled:opacity-60"
      >
        {loading ? 'Создаём оплату…' : 'Купить'}
      </button>
      {error && (
        <p className="text-sm text-red-600">
          Ошибка: {error}
        </p>
      )}
    </div>
  )
}
