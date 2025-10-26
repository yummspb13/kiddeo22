// src/app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from "next/server"
import { logUserBehavior } from "@/lib/admin-assistant"

// POST - Логирование события поведения пользователя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      sessionId, 
      eventType, 
      page, 
      element, 
      data 
    } = body

    if (!sessionId || !eventType || !page) {
      return NextResponse.json({ 
        error: "Необходимы sessionId, eventType и page" 
      }, { status: 400 })
    }

    // Получаем IP и User-Agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Логируем событие
    await logUserBehavior({
      userId: userId ? parseInt(userId) : undefined,
      sessionId,
      eventType,
      page,
      element,
      data,
      userAgent,
      ipAddress
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка логирования события:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
