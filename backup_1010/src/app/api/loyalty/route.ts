// src/app/api/loyalty/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { getLoyaltyStats, getLoyaltyHistory, spendLoyaltyPoints } from "@/lib/loyalty"

// GET - Получение статистики лояльности
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const limit = parseInt(searchParams.get('limit') || '50')

    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (type === 'history') {
      const history = await getLoyaltyHistory(userId, limit)
      return NextResponse.json(history)
    } else {
      const stats = await getLoyaltyStats(userId)
      return NextResponse.json(stats)
    }
  } catch (error) {
    console.error("Ошибка получения данных лояльности:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

// POST - Списание баллов лояльности
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json()
    const { points, orderId, description } = body

    if (!points || !orderId) {
      return NextResponse.json({ error: "Необходимы points и orderId" }, { status: 400 })
    }

    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const success = await spendLoyaltyPoints(
      userId,
      points,
      orderId,
      description
    )

    if (!success) {
      return NextResponse.json({ error: "Недостаточно баллов" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка списания баллов:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
