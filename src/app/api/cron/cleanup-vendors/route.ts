import { NextRequest, NextResponse } from 'next/server'
import { cleanupInactiveVendors, updateVendorWarnings } from '@/lib/cron-jobs'

// POST /api/cron/cleanup-vendors - запуск очистки вендоров (для cron)
export async function POST(request: NextRequest) {
  try {
    // Проверяем, что запрос приходит от cron сервиса или имеет правильный ключ
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🕐 Запуск cron job: очистка вендоров')
    
    // Обновляем предупреждения
    const warningResult = await updateVendorWarnings()
    console.log('⚠️ Результат обновления предупреждений:', warningResult)
    
    // Запускаем очистку
    const cleanupResult = await cleanupInactiveVendors()
    console.log('🧹 Результат очистки:', cleanupResult)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      warningResult,
      cleanupResult
    })

  } catch (error) {
    console.error('❌ Ошибка в cron job очистки вендоров:', error)
    return NextResponse.json({ 
      error: 'Cron job failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET /api/cron/cleanup-vendors - тестовый запуск (только для разработки)
export async function GET(request: NextRequest) {
  try {
    // В продакшене это должно быть отключено
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    console.log('🧪 Тестовый запуск очистки вендоров')
    
    const warningResult = await updateVendorWarnings()
    const cleanupResult = await cleanupInactiveVendors()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      warningResult,
      cleanupResult
    })

  } catch (error) {
    console.error('❌ Ошибка в тестовом запуске:', error)
    return NextResponse.json({ 
      error: 'Test run failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

