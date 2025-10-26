import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addPoints, POINTS_CATEGORIES, POINTS_VALUES } from '@/lib/points'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/simple-create-review - Request received')
    
    const body = await request.json()
    console.log('🔍 Request body:', body)
    
    const { eventId, venueId, userId, rating, comment, photos } = body

    if (!rating || rating < 1 || rating > 5) {
      console.log('❌ Invalid rating:', rating)
      return NextResponse.json({ error: 'Оценка должна быть от 1 до 5' }, { status: 400 })
    }

    // Определяем тип сущности
    const isVenue = !!venueId
    const entityId = isVenue ? venueId : eventId
    const entityType = isVenue ? 'venue' : 'event'
    
    if (!entityId) {
      return NextResponse.json({ error: 'Требуется ID события или места' }, { status: 400 })
    }

    console.log('🔍 Creating review for', entityType, ':', entityId, 'user:', userId, 'rating:', rating)

    // Проверяем, не оставлял ли пользователь уже отзыв
    const existingReview = isVenue 
      ? await prisma.venueReview.findFirst({
          where: { venueId: parseInt(venueId), userId: parseInt(userId) }
        })
      : await prisma.eventReview.findFirst({
          where: { eventId: eventId, userId: parseInt(userId) }
        })

    if (existingReview) {
      return NextResponse.json({ 
        success: false,
        error: isVenue ? 'Вы уже оставили отзыв на это место' : 'Вы уже оставили отзыв на это событие' 
      }, { status: 400 })
    }

    const reviewData: any = {
      userId: parseInt(userId),
      rating: rating,
      comment: comment || null,
      photos: photos || null,
      status: 'MODERATION'
    }

    if (isVenue) {
      reviewData.venueId = parseInt(venueId)
    } else {
      reviewData.eventId = eventId
    }

    const review = await prisma[isVenue ? 'venueReview' : 'eventReview'].create({
      data: reviewData,
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

    // Запускаем AI модерацию если включена
    if (process.env.REVIEW_MODERATION_ENABLED === 'true' && process.env.OPENAI_API_KEY) {
      try {
        // Получаем название сущности для контекста
        let entityName = 'Неизвестно'
        if (isVenue) {
          const venue = await prisma.venuePartner.findUnique({
            where: { id: parseInt(venueId) },
            select: { name: true }
          })
          entityName = venue?.name || 'Место'
        } else {
          const event = await prisma.afishaEvent.findUnique({
            where: { id: eventId },
            select: { title: true }
          })
          entityName = event?.title || 'Мероприятие'
        }

        // Запускаем модерацию асинхронно
        fetch('/api/admin/universal-review-moderation?key=kidsreview2025', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviewId: review.id,
            reviewType: isVenue ? 'venue' : 'event',
            rating: rating,
            comment: comment,
            photos: photos,
            entityName: entityName,
            entityType: isVenue ? 'Место' : 'Мероприятие'
          })
        }).catch(error => {
          console.error('Error triggering AI moderation:', error)
        })
      } catch (error) {
        console.error('Error setting up AI moderation:', error)
      }
    }

    // Начисляем баллы за отзыв
    try {
      const pointsResult = await addPoints({
        userId: parseInt(userId),
        points: POINTS_VALUES.WRITE_REVIEW,
        category: POINTS_CATEGORIES.WRITE_REVIEW,
        description: `Отзыв на ${entityType === 'venue' ? 'место' : 'событие'}`,
        eventId: entityId
      })
      
      if (pointsResult.success) {
        console.log('✅ Points awarded for review:', POINTS_VALUES.WRITE_REVIEW)
      } else {
        console.error('❌ Error awarding points:', pointsResult.error)
      }
    } catch (pointsError) {
      console.error('Error awarding points for review:', pointsError)
      // Не прерываем создание отзыва из-за ошибки с баллами
    }

    // Создаем активность при создании отзыва
    try {
      await prisma.userBehaviorEvent.create({
        data: {
          userId: parseInt(userId),
          sessionId: 'review-creation',
          eventType: 'review_created',
          page: isVenue ? `/city/moskva/venue/${venueId}` : `/event/${eventId}`,
          element: 'review-form',
          data: {
            reviewId: review.id,
            [isVenue ? 'venueId' : 'eventId']: entityId,
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
