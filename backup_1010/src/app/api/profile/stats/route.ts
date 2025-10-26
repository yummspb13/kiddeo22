import { NextRequest, NextResponse } from 'next/server'
import { getToken } from "@/lib/auth-utils"
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken(request)
    
    console.log('🔍 GET /api/profile/stats - Token:', {
      hasToken: !!token,
      userId: token?.sub,
      userEmail: token?.email
    })
    
    if (!token?.sub) {
      console.log('❌ Unauthorized: No token or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = token.sub

    // Получаем статистику параллельно
    const [
      childrenCount,
      ordersCount,
      favoritesCount,
      reviewsCount
    ] = await Promise.all([
      // Количество детей
      prisma.userChild.count({
        where: { userId: parseInt(userId) }
      }),
      
      // Количество заказов
      prisma.order.count({
        where: { userId: parseInt(userId) }
      }),
      
      // Количество избранного
      prisma.userFavorite.count({
        where: { userId: parseInt(userId) }
      }),
      
      // Количество отзывов
      prisma.userReview.count({
        where: { userId: parseInt(userId) }
      })
    ])

    return NextResponse.json({
      childrenCount,
      ordersCount,
      favoritesCount,
      reviewsCount
    })
  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
