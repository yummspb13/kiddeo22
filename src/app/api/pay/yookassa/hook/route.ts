// src/app/api/pay/yookassa/hook/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false }, { status: 400 })

  // Простейшая обработка событий
  const event = body.event as string
  const obj = body.object
  const ykId = obj?.id as string | undefined

  if (!ykId) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const payment = await prisma.payment.findFirst({ where: { ykId } })
    if (!payment) return NextResponse.json({ ok: true }) // игнорируем незнакомые

    if (event === 'payment.succeeded') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      })
    } else if (event === 'payment.canceled' || event === 'payment.expired') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
