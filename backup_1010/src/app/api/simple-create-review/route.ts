import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/simple-create-review - Request received')
    
    const body = await request.json()
    console.log('🔍 Request body:', body)
    
    const { eventId, userId, rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      console.log('❌ Invalid rating:', rating)
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    console.log('🔍 Creating review for event:', eventId, 'user:', userId, 'rating:', rating)

    const review = await prisma.eventReview.create({
      data: {
        eventId: eventId,
        userId: parseInt(userId), // Преобразуем строку в число
        rating: rating,
        comment: comment || null,
        status: 'APPROVED'
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

    console.log('✅ Review created:', review.id)

    // Создаем активность при создании отзыва
    try {
      await prisma.userBehaviorEvent.create({
        data: {
          userId: parseInt(userId),
          sessionId: 'review-creation',
          eventType: 'review_created',
          page: `/event/${eventId}`,
          element: 'review-form',
          data: {
            reviewId: review.id,
            eventId: eventId,
            rating: rating,
            hasComment: !!comment
          },
          userAgent: 'Kiddeo App',
          ipAddress: '127.0.0.1'
        }
      })
    } catch (activityError) {
      console.error('Error creating review activity:', activityError)
      // Не прерываем создание отзыва из-за ошибки с активностью
    }

    return NextResponse.json({ 
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: review.user
      }
    })
  } catch (error) {
    console.error('❌ Error creating review:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
