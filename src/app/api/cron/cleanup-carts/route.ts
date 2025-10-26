import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// POST - автоматическая очистка старых корзин (вызывается по cron)
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию для cron job
    const authHeader = request.headers.get('authorization')
    const expectedAuth = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🧹 Cron: Starting automatic cart cleanup')
    
    // Удаляем корзины старше 30 дней
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const result = await prisma.cart.deleteMany({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    })
    
    console.log(`🧹 Cron: Cleanup completed - removed ${result.count} old carts`)
    
    return NextResponse.json({ 
      success: true, 
      removedCount: result.count,
      cutoffDate: thirtyDaysAgo.toISOString()
    })
  } catch (error) {
    console.error('Cron cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - получить статистику корзин
export async function GET(request: NextRequest) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const [totalCarts, oldCarts, recentCarts] = await Promise.all([
      prisma.cart.count(),
      prisma.cart.count({
        where: {
          updatedAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.cart.count({
        where: {
          updatedAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ])
    
    return NextResponse.json({
      totalCarts,
      oldCarts,
      recentCarts,
      cutoffDate: thirtyDaysAgo.toISOString()
    })
  } catch (error) {
    console.error('Error getting cart stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
