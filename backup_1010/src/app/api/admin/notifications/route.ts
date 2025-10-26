import { NextRequest, NextResponse } from 'next/server'

interface NotificationCounts {
  users: number
  vendors: number
  leads: number
  listings: number
  vendorApprovals: number
}

// Моковые данные для демонстрации
const mockCounts: NotificationCounts = {
  users: 12,
  vendors: 8,
  leads: 25,
  listings: 15,
  vendorApprovals: 3
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const url = request.url
  
  try {
    console.log(`🔍 API: GET ${url} - Started at ${new Date().toISOString()}`)
    
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    console.log(`🔍 API: Admin key check - key: ${key}`)
    
    // Проверяем ключ доступа
    const isDev = process.env.NODE_ENV !== "production"
    const adminKey = (process.env.ADMIN_KEY || "").trim()
    
    if (key && key !== adminKey && !(isDev && key === "kidsreview2025")) {
      console.log(`🔍 API: Unauthorized access attempt`)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log(`🔍 API: Admin key check passed`)
    
    // В реальном приложении здесь был бы запрос к базе данных
    // const counts = await getAdminNotificationCounts()
    
    // Убрана искусственная задержка для ускорения (было 100ms)
    // await new Promise(resolve => setTimeout(resolve, 100))
    
    const duration = Date.now() - startTime
    console.log(`🔍 API: GET ${url} - Completed in ${duration}ms`)
    
    return NextResponse.json(mockCounts)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`🔍 API: GET ${url} - Error after ${duration}ms:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}