import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/simple-reactions - Request received')
    
    const body = await request.json()
    console.log('🔍 Request body:', body)
    
    const { reviewId, userId, type } = body

    if (!reviewId || !userId || !type) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (type !== 'LIKE' && type !== 'DISLIKE') {
      console.log('❌ Invalid reaction type:', type)
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    console.log('🔍 Creating reaction for review:', reviewId, 'user:', userId, 'type:', type)

    // Проверяем, есть ли уже реакция от этого пользователя
    const existingReaction = await prisma.reviewReaction.findFirst({
      where: {
        reviewId: reviewId,
        userId: parseInt(userId) // Преобразуем строку в число
      }
    })

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Удаляем реакцию, если она такая же
        await prisma.reviewReaction.delete({
          where: {
            id: existingReaction.id
          }
        })
        console.log('✅ Reaction removed (same type)')
      } else {
        // Обновляем тип реакции
        await prisma.reviewReaction.update({
          where: {
            id: existingReaction.id
          },
          data: {
            type: type as 'LIKE' | 'DISLIKE'
          }
        })
        console.log('✅ Reaction updated')
      }
    } else {
      // Создаем новую реакцию
      await prisma.reviewReaction.create({
        data: {
          reviewId: reviewId,
          userId: parseInt(userId), // Преобразуем строку в число
          type: type as 'LIKE' | 'DISLIKE'
        }
      })
      console.log('✅ New reaction created')
    }

    // Обновляем счетчики
    await updateReactionCounts(reviewId)

    // Создаем уведомление для автора отзыва (если это не тот же пользователь)
    try {
      const review = await prisma.eventReview.findUnique({
        where: { id: reviewId },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          event: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      if (review && review.userId !== parseInt(userId)) {
        console.log('🔍 Creating notification for review author:', {
          reviewId,
          authorId: review.userId,
          reactionType: type,
          reactionAuthorId: parseInt(userId),
          eventTitle: review.event.title
        })

        // Создаем активность для автора отзыва
        try {
          await prisma.userBehaviorEvent.create({
            data: {
              userId: review.userId,
              sessionId: 'review-reaction',
              eventType: 'review_reaction',
              page: `/event/${review.eventId}`,
              element: 'review-reaction',
              data: {
                reviewId: reviewId,
                eventId: review.eventId,
                eventTitle: review.event.title,
                reactionType: type,
                reactionAuthorId: parseInt(userId)
              },
              userAgent: 'Kiddeo App',
              ipAddress: '127.0.0.1'
            }
          })
          console.log('✅ Activity created for review author')
        } catch (activityError) {
          console.error('❌ Error creating activity:', activityError)
        }

        // Создаем уведомление в базе данных
        try {
          const notification = await prisma.userNotification.create({
            data: {
              userId: review.userId,
              type: 'review_reaction',
              title: 'Получена реакция на отзыв',
              message: `На ваш отзыв к мероприятию "${review.event.title}" поставили ${type === 'LIKE' ? 'лайк' : 'дизлайк'}.`,
              data: {
                reviewId: reviewId,
                eventId: review.eventId,
                eventTitle: review.event.title,
                reactionType: type,
                reactionAuthorId: parseInt(userId)
              },
              isRead: false,
              isActive: true
            }
          })
          console.log('✅ Notification created:', notification.id)
        } catch (notificationError) {
          console.error('❌ Error creating notification:', notificationError)
        }
      } else {
        console.log('⚠️ Skipping notification creation:', {
          hasReview: !!review,
          reviewAuthorId: review?.userId,
          currentUserId: parseInt(userId),
          isSameUser: review?.userId === parseInt(userId)
        })
      }
    } catch (notificationError) {
      console.error('Error creating reaction notification:', notificationError)
      // Не прерываем обработку реакции из-за ошибки с уведомлением
    }

    console.log('✅ Reaction processed successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error processing reaction:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function updateReactionCounts(reviewId: string) {
  try {
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

    console.log('✅ Reaction counts updated:', { likesCount, dislikesCount })
  } catch (error) {
    console.error('❌ Error updating reaction counts:', error)
  }
}
