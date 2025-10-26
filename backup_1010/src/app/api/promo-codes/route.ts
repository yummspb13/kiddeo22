// src/app/api/promo-codes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { applyPromoCode, createPromoCode } from "@/lib/loyalty"
import { requireAdminOrDevKey } from "@/lib/admin-guard"

// POST - Применение промокода
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    const body = await request.json()
    const { code, orderAmount } = body

    if (!code || !orderAmount) {
      return NextResponse.json({ error: "Необходимы code и orderAmount" }, { status: 400 })
    }

    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const result = await applyPromoCode(code, orderAmount, userId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Ошибка применения промокода:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

// PUT - Создание промокода (только для админов)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    const searchParams = await request.nextUrl.searchParams
    
    // Проверяем доступ администратора
    try {
      await requireAdminOrDevKey(session as any, "admin")
    } catch (error) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const body = await request.json()
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      applicableTo,
      description
    } = body

    if (!code || !type || !value || !validFrom || !validUntil) {
      return NextResponse.json({ error: "Необходимы code, type, value, validFrom, validUntil" }, { status: 400 })
    }

    const promoCode = await createPromoCode({
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      applicableTo,
      description
    })

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error("Ошибка создания промокода:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
