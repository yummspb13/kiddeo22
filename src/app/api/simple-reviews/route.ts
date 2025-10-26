import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const venueId = searchParams.get('venueId')
    const status = searchParams.get('status') || 'APPROVED'

    console.log('🔍 GET /api/simple-reviews - eventId:', eventId, 'venueId:', venueId, 'status:', status)

    if (!eventId && !venueId) {
      return NextResponse.json({ error: 'Event ID or Venue ID is required' }, { status: 400 })
    }

    // Определяем тип сущности и используем соответствующую модель
    const isVenue = !!venueId
    const reviewModel = isVenue ? 'venueReview' : 'eventReview'
    const idField = isVenue ? 'venueId' : 'eventId'
    const entityId = isVenue ? parseInt(venueId!) : eventId!

    const whereClause: any = {
      [idField]: entityId
    }
    
    // Если status не ALL, добавляем фильтр по статусу
    if (status !== 'ALL') {
      whereClause.status = status as 'MODERATION' | 'APPROVED' | 'REJECTED' | 'HIDDEN'
    }

    const reviews = await prisma[reviewModel].findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        replies: {
          where: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ Found reviews:', reviews.length)
    return NextResponse.json({ reviews }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Error fetching reviews:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
