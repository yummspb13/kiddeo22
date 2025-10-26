import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить ответы на отзыв
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    
    console.log('🔍 GET /api/reviews/[reviewId]/replies - ReviewId:', reviewId)

    const replies = await prisma.reviewReply.findMany({
      where: {
        reviewId: reviewId,
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
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('✅ Found replies:', replies.length)
    return NextResponse.json({ replies }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Error fetching replies:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - удалить ответ на отзыв
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const { replyId } = await request.json()

    if (!replyId) {
      return NextResponse.json({ error: 'Reply ID is required' }, { status: 400 })
    }

    console.log('🔍 DELETE /api/reviews/[reviewId]/replies - ReviewId:', reviewId, 'ReplyId:', replyId)

    await prisma.reviewReply.delete({
      where: {
        id: replyId
      }
    })

    console.log('✅ Reply deleted:', replyId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting reply:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - создать ответ на отзыв
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const { message, userId } = await request.json()
    
    console.log('🔍 POST /api/reviews/[reviewId]/replies - ReviewId:', reviewId, 'UserId:', userId)

    if (!message || !userId) {
      return NextResponse.json({ error: 'Message and user ID are required' }, { status: 400 })
    }

    // Проверяем, существует ли отзыв
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

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Создаем ответ
    const reply = await prisma.reviewReply.create({
      data: {
        reviewId: reviewId,
        userId: parseInt(userId),
        message: message.trim(),
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

    console.log('✅ Reply created:', reply.id)

    // Создаем активность для автора отзыва (кому отвечают)
    try {
      await prisma.userBehaviorEvent.create({
        data: {
          userId: review.userId, // Автор отзыва получает уведомление
          sessionId: 'review-reply',
          eventType: 'review_reply_received',
          page: `/event/${review.eventId}`,
          element: 'review-reply',
          data: {
            replyId: reply.id,
            reviewId: reviewId,
            eventId: review.eventId,
            eventTitle: review.event.title,
            replyAuthorId: parseInt(userId),
            replyAuthorName: reply.user.name
          },
          userAgent: 'Kiddeo App',
          ipAddress: '127.0.0.1'
        }
      })
    } catch (activityError) {
      console.error('Error creating reply activity:', activityError)
      // Не прерываем создание ответа из-за ошибки с активностью
    }

    // Отправляем уведомление автору отзыва (если это не тот же пользователь)
    if (review.userId !== parseInt(userId)) {
      try {
        // Создаем уведомление в базе данных
        await prisma.userNotification.create({
          data: {
            userId: review.userId,
            type: 'review_reply_received',
            title: 'Получен ответ на отзыв',
            message: `На ваш отзыв к мероприятию "${review.event.title}" ответил ${reply.user.name || 'пользователь'}.`,
            data: {
              reviewId: reviewId,
              replyId: reply.id,
              eventId: review.eventId,
              eventTitle: review.event.title,
              replyAuthorId: parseInt(userId),
              replyAuthorName: reply.user.name
            },
            isRead: false,
            isActive: true
          }
        })
        
        console.log('📢 Notification created for review author:', {
          reviewId,
          authorId: review.userId,
          replyAuthorId: parseInt(userId),
          eventTitle: review.event.title
        })
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError)
      }
    }

    return NextResponse.json({ 
      success: true,
      reply: {
        id: reply.id,
        message: reply.message,
        createdAt: reply.createdAt,
        user: reply.user
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Error creating reply:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
