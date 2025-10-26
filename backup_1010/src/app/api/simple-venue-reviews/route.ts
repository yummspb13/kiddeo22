import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ReviewStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Убрали withApiGuard для ускорения + добавили прямой таймаут на Prisma
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venueId')
    const status = searchParams.get('status')

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    // Оптимизированный запрос с таймаутом 3 секунды
    const reviewsPromise = prisma.venueReview.findMany({
      where: {
        venueId: parseInt(venueId),
        ...(status ? { status: status as ReviewStatus } : {})
      },
      select: {
        id: true,
        venueId: true,
        userId: true,
        rating: true,
        comment: true,
        photos: true,
        status: true,
        likesCount: true,
        dislikesCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        replies: {
          select: {
            id: true,
            message: true,
            userId: true,
            createdAt: true,
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Лимит для безопасности
    })

    const reviews = await Promise.race([
      reviewsPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
    ])

    if (!reviews) {
      console.error('⚠️ Timeout fetching venue reviews')
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
    }

    const duration = Date.now() - startTime
    if (duration > 1000) {
      console.warn(`⚠️ Slow /api/simple-venue-reviews: ${duration}ms for venue ${venueId}`)
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ /api/simple-venue-reviews error after ${duration}ms:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
