import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    console.log('🔍 API: POST /api/venue-reviews/[reviewId]/reactions - Started')
    const { reviewId } = params
    const { type } = await request.json()
    const userId = request.headers.get('x-user-id')
    
    console.log('🔍 API: Reaction data:', { reviewId, type, userId })

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    if (!type || !['LIKE', 'DISLIKE'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    // Проверяем, существует ли отзыв
    console.log('🔍 API: Checking if review exists:', reviewId)
    const review = await prisma.venueReview.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      console.log('❌ API: Review not found:', reviewId)
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    console.log('✅ API: Review found:', review.id)

    // Проверяем, не поставил ли пользователь уже реакцию
    console.log('🔍 API: Checking existing reaction for user:', userId, 'review:', reviewId)
    const existingReaction = await prisma.venueReviewReaction.findFirst({
      where: {
        reviewId,
        userId: parseInt(userId)
      }
    })

    console.log('🔍 API: Existing reaction:', existingReaction)
    if (existingReaction) {
      console.log('🔍 API: Updating existing reaction')
      if (existingReaction.type === type) {
        // Удаляем реакцию, если пользователь нажал на ту же реакцию
        await prisma.venueReviewReaction.delete({
          where: { id: existingReaction.id }
        })
      } else {
        // Изменяем тип реакции
        await prisma.venueReviewReaction.update({
          where: { id: existingReaction.id },
          data: { type }
        })
      }
    } else {
      console.log('🔍 API: Creating new reaction')
      // Создаем новую реакцию
      await prisma.venueReviewReaction.create({
        data: {
          reviewId,
          userId: parseInt(userId),
          type
        }
      })
    }
    
    // Пересчитываем счетчики
    const allReactions = await prisma.venueReviewReaction.findMany({
      where: { reviewId }
    })
    
    const likesCount = allReactions.filter(r => r.type === 'LIKE').length
    const dislikesCount = allReactions.filter(r => r.type === 'DISLIKE').length
    
    await prisma.venueReview.update({
      where: { id: reviewId },
      data: { likesCount, dislikesCount }
    })
    
    console.log('🔍 API: Updated counters:', { likesCount, dislikesCount })

    console.log('✅ API: Reaction processed successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ API: Error handling venue review reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
