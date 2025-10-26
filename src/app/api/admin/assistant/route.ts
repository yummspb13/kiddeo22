// src/app/api/admin/assistant/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { requireAdminOrDevKey } from "@/lib/admin-guard"
import { 
  getAdminInsights, 
  resolveInsight, 
  analyzeUserBehavior, 
  analyzeVendorPerformance,
  getDashboardStats,
  generateInsights
} from "@/lib/admin-assistant"

// GET - Получение инсайтов и аналитики
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const searchParams = await request.nextUrl.searchParams
    const sp = Object.fromEntries(searchParams.entries())
    
    // Проверяем доступ администратора
    try {
      await requireAdminOrDevKey(sp)
    } catch (error) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const tab = searchParams.get('tab') || 'insights'
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const isResolved = searchParams.get('isResolved')
    const days = parseInt(searchParams.get('days') || '7')

    let data

    switch (tab) {
      case 'insights':
        data = await getAdminInsights({
          type: type as any,
          priority: priority as any,
          isResolved: isResolved ? isResolved === 'true' : undefined,
          limit: 50
        })
        break

      case 'analytics':
        const [userBehavior, vendorPerformance] = await Promise.all([
          analyzeUserBehavior(days),
          analyzeVendorPerformance(days * 4) // 4 недели для вендоров
        ])
        data = { userBehavior, vendorPerformance }
        break

      case 'stats':
        data = await getDashboardStats()
        break

      default:
        return NextResponse.json({ error: "Неверный параметр tab" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Ошибка получения данных ассистента:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

// POST - Создание инсайта или генерация рекомендаций
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const searchParams = await request.nextUrl.searchParams
    const sp = Object.fromEntries(searchParams.entries())
    
    // Проверяем доступ администратора
    try {
      await requireAdminOrDevKey(sp)
    } catch (error) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'generate_insights':
        const insights = await generateInsights()
        return NextResponse.json({ insights, message: "Инсайты сгенерированы" })

      case 'resolve_insight':
        const { insightId } = body
        if (!insightId) {
          return NextResponse.json({ error: "Необходим ID инсайта" }, { status: 400 })
        }
        
        // TODO: Получить ID администратора из сессии
        await resolveInsight(insightId, 1)
        return NextResponse.json({ message: "Инсайт отмечен как решенный" })

      default:
        return NextResponse.json({ error: "Неверное действие" }, { status: 400 })
    }
  } catch (error) {
    console.error("Ошибка обработки запроса ассистента:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
