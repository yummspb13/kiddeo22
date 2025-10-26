import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET - получить все отзывы (события + места)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = searchParams.get('status') || 'MODERATION'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || 'all'

    console.log('🔍 Universal Reviews API:', { status, page, limit, type })

    // Получаем отзывы событий
    const eventReviews = status === 'ALL' || type === 'all' || type === 'event' 
      ? await prisma.eventReview.findMany({
          where: status === 'ALL' ? {} : { status },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            event: {
              select: {
                id: true,
                title: true,
                slug: true,
                startDate: true,
                endDate: true,
                venue: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      : []

    // Получаем отзывы мест
    const venueReviews = status === 'ALL' || type === 'all' || type === 'venue'
      ? await prisma.venueReview.findMany({
          where: status === 'ALL' ? {} : { status },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            venue: {
              select: {
                id: true,
                name: true,
                slug: true,
                address: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      : []

    // Объединяем и нормализуем отзывы
    const allReviews = [
      ...eventReviews.map(review => ({
        id: review.id,
        type: 'event' as const,
        rating: review.rating,
        comment: review.comment,
        photos: review.photos,
        status: review.status,
        createdAt: review.createdAt,
        user: review.user,
        entity: {
          id: review.event.id,
          name: review.event.title,
          slug: review.event.slug,
          startDate: review.event.startDate,
          endDate: review.event.endDate,
          address: review.event.venue
        },
        reactions: [],
        replies: []
      })),
      ...venueReviews.map(review => ({
        id: review.id,
        type: 'venue' as const,
        rating: review.rating,
        comment: review.comment,
        photos: review.photos,
        status: review.status,
        createdAt: review.createdAt,
        user: review.user,
        entity: {
          id: review.venue.id,
          name: review.venue.name,
          slug: review.venue.slug,
          address: review.venue.address
        },
        reactions: [],
        replies: []
      }))
    ]

    // Сортируем по дате создания
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Пагинация
    const total = allReviews.length
    const pages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReviews = allReviews.slice(startIndex, endIndex)

    console.log('✅ Universal Reviews fetched:', {
      total,
      eventReviews: eventReviews.length,
      venueReviews: venueReviews.length,
      returned: paginatedReviews.length
    })

    return NextResponse.json({
      reviews: paginatedReviews,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('Error fetching universal reviews:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH - модерация отзыва
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, status, moderatorNotes } = body

    if (!reviewId || !status) {
      return NextResponse.json({ error: 'Missing reviewId or status' }, { status: 400 })
    }

    console.log('🔍 Universal Review Moderation:', { reviewId, status, moderatorNotes })

    // Определяем тип отзыва и обновляем статус
    let updatedReview = null

    // Пробуем обновить как отзыв события
    try {
      updatedReview = await prisma.eventReview.update({
        where: { id: reviewId },
        data: { status },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true } }
        }
      })
      console.log('✅ Event review updated:', updatedReview.id)
    } catch (error) {
      // Если не найден как отзыв события, пробуем как отзыв места
      try {
        updatedReview = await prisma.venueReview.update({
          where: { id: reviewId },
          data: { status },
          include: {
            user: { select: { id: true, name: true, email: true } },
            venue: { select: { id: true, name: true } }
          }
        })
        console.log('✅ Venue review updated:', updatedReview.id)
      } catch (venueError) {
        console.error('❌ Review not found:', reviewId)
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }
    }

    // Логируем модерацию
    console.log('🎯 Review moderated:', {
      reviewId,
      status,
      moderatorNotes,
      reviewType: updatedReview.event ? 'event' : 'venue',
      entityName: updatedReview.event?.title || updatedReview.venue?.name
    })

    return NextResponse.json({ 
      success: true,
      review: updatedReview
    })

  } catch (error) {
    console.error('Error moderating review:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
