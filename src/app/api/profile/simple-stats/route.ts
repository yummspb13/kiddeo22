import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка (временно для тестирования)
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/simple-stats - UserId:', userIdInt)

    // Получаем статистику
    const [
      childrenCount,
      ordersCount,
      favoritesCount,
      reviewsCount
    ] = await Promise.all([
      prisma.userChild.count({
        where: { userId: userIdInt }
      }),
      prisma.order.count({
        where: { userId: userIdInt }
      }),
      prisma.userFavorite.count({
        where: { userId: userIdInt }
      }),
      prisma.eventReview.count({
        where: { userId: userIdInt }
      })
    ])

    return NextResponse.json({
      childrenCount,
      ordersCount,
      favoritesCount,
      reviewsCount
    })
  } catch (error) {
    console.error('Error fetching simple stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
