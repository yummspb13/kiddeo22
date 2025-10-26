import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { deductPoints, POINTS_VALUES, POINTS_CATEGORIES } from '@/lib/points'

export async function PUT(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const reviewId = params.reviewId
    const { rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ 
        success: false,
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 })
    }

    // Обновляем отзыв
    const updatedReview = await prisma.venueReview.update({
      where: { id: reviewId },
      data: {
        rating: parseInt(rating),
        comment: comment || null,
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

    return NextResponse.json({ 
      success: true, 
      review: updatedReview 
    })

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const reviewId = params.reviewId

    // Получаем отзыв перед удалением для списания баллов
    const review = await prisma.venueReview.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ 
        success: false,
        error: 'Review not found' 
      }, { status: 404 })
    }

    // Списываем баллы за удаление отзыва
    try {
      const deductResult = await deductPoints({
        userId: review.userId,
        points: POINTS_VALUES.RATE_VENUE,
        category: POINTS_CATEGORIES.RATE_VENUE,
        description: 'Удаление отзыва о месте',
        eventId: review.venueId?.toString()
      })
      
      if (deductResult.success) {
        console.log('✅ Points deducted for venue review deletion:', POINTS_VALUES.RATE_VENUE)
      } else {
        console.error('❌ Error deducting points:', deductResult.error)
        // Не прерываем удаление отзыва из-за ошибки с баллами
      }
    } catch (pointsError) {
      console.error('Error deducting points for venue review deletion:', pointsError)
      // Не прерываем удаление отзыва из-за ошибки с баллами
    }

    // Удаляем отзыв
    await prisma.venueReview.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ 
      success: true 
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
