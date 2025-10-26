import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// POST - добавить реакцию на отзыв
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const reviewId = (await params).reviewId
    const { type } = await request.json()
    
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Требуется ID пользователя' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Неверный ID пользователя' }, { status: 400 })
    }

    if (!type || !['LIKE', 'DISLIKE'].includes(type)) {
      return NextResponse.json({ error: 'Тип должен быть LIKE или DISLIKE' }, { status: 400 })
    }

    console.log('🔍 POST /api/reviews/[reviewId]/reactions - ReviewId:', reviewId, 'UserId:', userIdInt, 'Type:', type)

    // Определяем тип отзыва (событие или место)
    const eventReview = await prisma.eventReview.findUnique({ where: { id: reviewId } })
    const venueReview = await prisma.venueReview.findUnique({ where: { id: reviewId } })
    
    if (!eventReview && !venueReview) {
      return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 })
    }

    const isVenueReview = !!venueReview
    const modelName = isVenueReview ? 'venueReviewReaction' : 'reviewReaction'

    // Проверяем, существует ли уже реакция от этого пользователя
    const existingReaction = await prisma[modelName].findFirst({
      where: {
        reviewId: reviewId,
        userId: userIdInt
      }
    })

    if (existingReaction) {
      // Если реакция уже существует, обновляем её
      const updatedReaction = await prisma[modelName].update({
        where: {
          id: existingReaction.id
        },
        data: {
          type: type
        }
      })

      // Обновляем счетчики
      await updateReactionCounts(reviewId, isVenueReview)

      return NextResponse.json({ reaction: updatedReaction })
    } else {
      // Создаем новую реакцию
      const reaction = await prisma[modelName].create({
        data: {
          reviewId: reviewId,
          userId: userIdInt,
          type: type as 'LIKE' | 'DISLIKE'
        }
      })

      // Обновляем счетчики
      await updateReactionCounts(reviewId, isVenueReview)

      return NextResponse.json({ reaction })
    }
  } catch (error) {
    console.error('Error creating reaction:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// DELETE - удалить реакцию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const reviewId = (await params).reviewId
    
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Требуется ID пользователя' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Неверный ID пользователя' }, { status: 400 })
    }

    console.log('🔍 DELETE /api/reviews/[reviewId]/reactions - ReviewId:', reviewId, 'UserId:', userIdInt)

    // Определяем тип отзыва (событие или место)
    const eventReview = await prisma.eventReview.findUnique({ where: { id: reviewId } })
    const venueReview = await prisma.venueReview.findUnique({ where: { id: reviewId } })
    
    if (!eventReview && !venueReview) {
      return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 })
    }

    const isVenueReview = !!venueReview
    const modelName = isVenueReview ? 'venueReviewReaction' : 'reviewReaction'

    // Удаляем реакцию
    await prisma[modelName].deleteMany({
      where: {
        reviewId: reviewId,
        userId: userIdInt
      }
    })

    // Обновляем счетчики
    await updateReactionCounts(reviewId, isVenueReview)

    return NextResponse.json({ message: 'Реакция удалена' })
  } catch (error) {
    console.error('Error removing reaction:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Функция для обновления счетчиков реакций
async function updateReactionCounts(reviewId: string, isVenueReview: boolean) {
  const reactionModel = isVenueReview ? 'venueReviewReaction' : 'reviewReaction'
  const reviewModel = isVenueReview ? 'venueReview' : 'eventReview'

  const likesCount = await prisma[reactionModel].count({
    where: {
      reviewId: reviewId,
      type: 'LIKE'
    }
  })

  const dislikesCount = await prisma[reactionModel].count({
    where: {
      reviewId: reviewId,
      type: 'DISLIKE'
    }
  })

  await prisma[reviewModel].update({
    where: {
      id: reviewId
    },
    data: {
      likesCount: likesCount,
      dislikesCount: dislikesCount
    }
  })
}
