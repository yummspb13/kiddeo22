import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// POST - очистить старые корзины (старше 30 дней)
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting cart cleanup - removing carts older than 30 days')
    
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
    
    console.log(`🧹 Cleanup completed - removed ${result.count} old carts`)
    
    return NextResponse.json({ 
      success: true, 
      removedCount: result.count,
      cutoffDate: thirtyDaysAgo.toISOString()
    })
  } catch (error) {
    console.error('Error during cart cleanup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - получить статистику корзин
export async function GET(request: NextRequest) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const [totalCarts, oldCarts] = await Promise.all([
      prisma.cart.count(),
      prisma.cart.count({
        where: {
          updatedAt: {
            lt: thirtyDaysAgo
          }
        }
      })
    ])
    
    return NextResponse.json({
      totalCarts,
      oldCarts,
      cutoffDate: thirtyDaysAgo.toISOString()
    })
  } catch (error) {
    console.error('Error getting cart stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
