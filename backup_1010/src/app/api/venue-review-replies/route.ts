import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 VENUE REVIEW REPLIES API: Starting request')
    
    // Временно убираем проверку аутентификации для тестирования
    const { reviewId, message } = await request.json()
    console.log('🔍 VENUE REVIEW REPLIES API: Data:', { reviewId, message })

    // Используем ID пользователя 1 для тестирования
    const userId = '1'

    if (!reviewId || !message?.trim()) {
      return NextResponse.json({ error: 'Review ID and message are required' }, { status: 400 })
    }

    // Проверяем, существует ли отзыв
    const review = await prisma.venueReview.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Создаем ответ
    const reply = await prisma.venueReviewReply.create({
      data: {
        reviewId,
        userId: parseInt(userId),
        message: message.trim(),
        status: 'APPROVED' // Автоматически одобряем ответы
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      reply 
    })
  } catch (error) {
    console.error('Error creating venue review reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
