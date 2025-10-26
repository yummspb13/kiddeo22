// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { createYooKassaPayment } from "@/lib/yookassa"
import { getOrderWithDetails } from "@/lib/orders"

// POST - Создание платежа
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, returnUrl } = body

    if (!orderId || !returnUrl) {
      return NextResponse.json({ error: "Необходимы orderId и returnUrl" }, { status: 400 })
    }

    // Получаем заказ
    const order = await getOrderWithDetails(orderId)
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }

    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Проверяем права доступа
    if (order.user.id !== userId) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    // Проверяем статус заказа
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: "Заказ уже обработан" }, { status: 400 })
    }

    // Создаем платеж
    const payment = await createYooKassaPayment(
      orderId,
      order.finalAmount,
      `Оплата заказа ${orderId}`,
      returnUrl,
      order.user.id,
      order.vendor.id
    )

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Ошибка создания платежа:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
