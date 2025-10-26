import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredAds } from '@/lib/cron/cleanup-expired-ads'

// POST - запустить очистку истекших объявлений
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию (можно добавить API ключ)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await cleanupExpiredAds()
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error in cleanup cron job:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup expired ads' },
      { status: 500 }
    )
  }
}

// GET - для тестирования (только в dev режиме)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

  try {
    const result = await cleanupExpiredAds()
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error in cleanup cron job:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup expired ads' },
      { status: 500 }
    )
  }
}
