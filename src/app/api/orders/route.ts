// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { createOrder, getUserOrders, getVendorOrders } from "@/lib/orders"
import { requireVendorAccess } from "@/lib/vendor-guard"

// POST - Создание заказа
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json()
    const { vendorId, listingId, items, promoCode, loyaltyPointsUsed, notes } = body

    if (!vendorId || !listingId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Необходимы vendorId, listingId и items" }, { status: 400 })
    }

    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Проверяем доступ вендора (если пользователь - вендор)
    const vendorAccess = await requireVendorAccess(userId)
    if (vendorAccess && vendorAccess.id !== vendorId) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const order = await createOrder({
      userId,
      vendorId,
      listingId,
      items,
      promoCode,
      loyaltyPointsUsed,
      notes
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Ошибка создания заказа:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

// GET - Получение заказов
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user' // 'user' или 'vendor'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let result

    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (type === 'vendor') {
      // Проверяем доступ вендора
      const vendorAccess = await requireVendorAccess(userId)
      if (!vendorAccess) {
        return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
      }

      result = await getVendorOrders(vendorAccess.id, limit, offset)
    } else {
      result = await getUserOrders(userId, limit, offset)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Ошибка получения заказов:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
