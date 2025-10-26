import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить отзывы пользователя
export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    // Получаем параметры пагинации
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    console.log('🔍 GET /api/profile/reviews - UserId:', userIdInt, 'Page:', page, 'Limit:', limit)

    // Получаем общее количество отзывов
    const totalReviews = await prisma.eventReview.count({
      where: {
        userId: userIdInt
      }
    })

    const reviews = await prisma.eventReview.findMany({
      where: {
        userId: userIdInt
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            startDate: true,
            venue: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(totalReviews / limit)

    return NextResponse.json({ 
      reviews, 
      totalReviews, 
      totalPages, 
      currentPage: page 
    })
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
