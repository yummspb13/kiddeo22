import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { deductPoints, POINTS_VALUES, POINTS_CATEGORIES } from '@/lib/points'
export const runtime = 'nodejs'

// PUT - обновить отзыв
export async function PUT(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params
    const { rating, comment, photos } = await request.json()
    
    console.log('🔍 PUT /api/simple-reviews/[reviewId] - ReviewId:', reviewId, 'Rating:', rating)

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ 
        success: false,
        error: 'Оценка должна быть от 1 до 5' 
      }, { status: 400 })
    }

    // Определяем тип отзыва (событие или место)
    const eventReview = await prisma.eventReview.findUnique({ where: { id: reviewId } })
    const venueReview = await prisma.venueReview.findUnique({ where: { id: reviewId } })
    
    if (!eventReview && !venueReview) {
      return NextResponse.json({ 
        success: false,
        error: 'Отзыв не найден' 
      }, { status: 404 })
    }

    const isVenue = !!venueReview
    const reviewModel = isVenue ? 'venueReview' : 'eventReview'

    // Обновляем отзыв
    const updatedReview = await prisma[reviewModel].update({
      where: {
        id: reviewId
      },
      data: {
        rating: parseInt(rating),
        comment: comment || null,
        photos: photos || null,
        updatedAt: new Date()
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

    console.log('✅ Review updated:', reviewId, 'type:', isVenue ? 'venue' : 'event')
    return NextResponse.json({ 
      success: true, 
      review: updatedReview 
    })
  } catch (error) {
    console.error('❌ Error updating review:', error)
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params
    console.log('🔍 DELETE /api/simple-reviews/[reviewId] - ReviewId:', reviewId)

    // Определяем тип отзыва (событие или место)
    const eventReview = await prisma.eventReview.findUnique({ where: { id: reviewId } })
    const venueReview = await prisma.venueReview.findUnique({ where: { id: reviewId } })
    
    if (!eventReview && !venueReview) {
      return NextResponse.json({ 
        success: false,
        error: 'Отзыв не найден' 
      }, { status: 404 })
    }

    const isVenue = !!venueReview
    const reviewModel = isVenue ? 'venueReview' : 'eventReview'
    const review = isVenue ? venueReview : eventReview

    // Списываем баллы за удаление отзыва
    try {
      const pointsToDeduct = isVenue ? POINTS_VALUES.RATE_VENUE : POINTS_VALUES.WRITE_REVIEW
      const category = isVenue ? POINTS_CATEGORIES.RATE_VENUE : POINTS_CATEGORIES.WRITE_REVIEW
      
      const deductResult = await deductPoints({
        userId: review.userId,
        points: pointsToDeduct,
        category,
        description: `Удаление отзыва на ${isVenue ? 'место' : 'событие'}`,
        eventId: isVenue ? review.venueId?.toString() : review.eventId
      })
      
      if (deductResult.success) {
        console.log('✅ Points deducted for review deletion:', pointsToDeduct)
      } else {
        console.error('❌ Error deducting points:', deductResult.error)
        // Не прерываем удаление отзыва из-за ошибки с баллами
      }
    } catch (pointsError) {
      console.error('Error deducting points for review deletion:', pointsError)
      // Не прерываем удаление отзыва из-за ошибки с баллами
    }

    // Удаляем отзыв (каскадное удаление удалит все связанные реакции и ответы)
    await prisma[reviewModel].delete({
      where: {
        id: reviewId
      }
    })

    console.log('✅ Review deleted:', reviewId, 'type:', isVenue ? 'venue' : 'event')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting review:', error)
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  }
}
