// src/app/api/vendor/ai-assistant/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { createAIRequest, getVendorAIHistory } from "@/lib/ai-assistant"
import { requireVendorAccess } from "@/lib/vendor-guard"

// POST - Создание запроса к ИИ-помощнику
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    // Проверяем доступ вендора
    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const vendorAccess = await requireVendorAccess(userId)
    if (!vendorAccess) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const body = await request.json()
    const { type, prompt, metadata } = body

    if (!type || !prompt) {
      return NextResponse.json({ error: "Необходимы тип и промпт" }, { status: 400 })
    }

    // Создаем запрос к ИИ
    const aiResponse = await createAIRequest({
      vendorId: vendorAccess.id,
      type,
      prompt,
      metadata
    })

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error("Ошибка создания запроса к ИИ:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

// GET - Получение истории запросов
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 })
    }

    // Проверяем доступ вендора
    const userId = session.user.uid
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const vendorAccess = await requireVendorAccess(userId)
    if (!vendorAccess) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const history = await getVendorAIHistory(vendorAccess.id, limit)

    return NextResponse.json(history)
  } catch (error) {
    console.error("Ошибка получения истории ИИ:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
