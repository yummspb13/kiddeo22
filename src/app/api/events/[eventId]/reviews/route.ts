import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET - получить отзывы для события
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const eventId = (await params).eventId
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'APPROVED'

    console.log('🔍 GET /api/events/[eventId]/reviews - EventId:', eventId, 'Status:', status)

    const reviews = await prisma.eventReview.findMany({
      where: {
        eventId: eventId,
        status: status as any
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - создать отзыв
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const eventId = (await params).eventId
    const { rating, comment } = await request.json()
    
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    console.log('🔍 POST /api/events/[eventId]/reviews - EventId:', eventId, 'UserId:', userIdInt, 'Rating:', rating)

    // Проверяем, существует ли уже отзыв от этого пользователя
    const existingReview = await prisma.eventReview.findFirst({
      where: {
        eventId: eventId,
        userId: userIdInt
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this event' }, { status: 400 })
    }

    // Создаем отзыв
    const review = await prisma.eventReview.create({
      data: {
        eventId: eventId,
        userId: userIdInt,
        rating: rating,
        comment: comment || null,
        status: 'MODERATION'
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

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
