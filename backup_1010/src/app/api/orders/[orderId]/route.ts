// src/app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { getOrderWithDetails, cancelOrder } from "@/lib/orders"
import { requireVendorAccess } from "@/lib/vendor-guard"

interface RouteParams {
  params: Promise<{ orderId: string }>
}

// GET - Получение заказа
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const { orderId } = await params
    const order = await getOrderWithDetails(orderId)

    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }

    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Проверяем права доступа
    const isOwner = order.user.id === userId
    const isVendor = order.vendor.id === userId

    if (!isOwner && !isVendor) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Ошибка получения заказа:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

// PATCH - Обновление заказа (отмена)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const { orderId } = await params
    const body = await request.json()
    const { action, reason } = body

    if (action === 'cancel') {
      const userId = session.user.uid
      if (!userId) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
      }

      // Проверяем права на отмену
      const order = await getOrderWithDetails(orderId)
      if (!order) {
        return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
      }

      const isOwner = order.user.id === userId
      const isVendor = order.vendor.id === userId

      if (!isOwner && !isVendor) {
        return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
      }

      await cancelOrder(orderId, reason)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 })
  } catch (error) {
    console.error("Ошибка обновления заказа:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
