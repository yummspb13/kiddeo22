import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    if (!type || !['LIKE', 'DISLIKE'].includes(type)) {
      return NextResponse.json({ error: 'Type must be LIKE or DISLIKE' }, { status: 400 })
    }

    console.log('🔍 POST /api/reviews/[reviewId]/reactions - ReviewId:', reviewId, 'UserId:', userIdInt, 'Type:', type)

    // Проверяем, существует ли уже реакция от этого пользователя
    const existingReaction = await prisma.reviewReaction.findFirst({
      where: {
        reviewId: reviewId,
        userId: userIdInt
      }
    })

    if (existingReaction) {
      // Если реакция уже существует, обновляем её
      const updatedReaction = await prisma.reviewReaction.update({
        where: {
          id: existingReaction.id
        },
        data: {
          type: type
        }
      })

      // Обновляем счетчики
      await updateReactionCounts(reviewId)

      return NextResponse.json({ reaction: updatedReaction })
    } else {
      // Создаем новую реакцию
      const reaction = await prisma.reviewReaction.create({
        data: {
          reviewId: reviewId,
          userId: userIdInt,
          type: type as 'LIKE' | 'DISLIKE'
        }
      })

      // Обновляем счетчики
      await updateReactionCounts(reviewId)

      return NextResponse.json({ reaction })
    }
  } catch (error) {
    console.error('Error creating reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    console.log('🔍 DELETE /api/reviews/[reviewId]/reactions - ReviewId:', reviewId, 'UserId:', userIdInt)

    // Удаляем реакцию
    await prisma.reviewReaction.deleteMany({
      where: {
        reviewId: reviewId,
        userId: userIdInt
      }
    })

    // Обновляем счетчики
    await updateReactionCounts(reviewId)

    return NextResponse.json({ message: 'Reaction removed' })
  } catch (error) {
    console.error('Error removing reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Функция для обновления счетчиков реакций
async function updateReactionCounts(reviewId: string) {
  const likesCount = await prisma.reviewReaction.count({
    where: {
      reviewId: reviewId,
      type: 'LIKE'
    }
  })

  const dislikesCount = await prisma.reviewReaction.count({
    where: {
      reviewId: reviewId,
      type: 'DISLIKE'
    }
  })

  await prisma.eventReview.update({
    where: {
      id: reviewId
    },
    data: {
      likesCount: likesCount,
      dislikesCount: dislikesCount
    }
  })
}
