import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth-server'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 VENDOR REVIEWS API: Starting request')
    
    const { id } = await params
    const venueId = parseInt(id)
    console.log('🔍 VENDOR REVIEWS API: Venue ID:', venueId)
    
    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 })
    }

    // Проверяем, что место существует
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId }
    })

    console.log('🔍 VENDOR REVIEWS API: Venue found:', !!venue)
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Получаем отзывы
    console.log('🔍 VENDOR REVIEWS API: Fetching reviews for venue:', venueId)
    const reviews = await prisma.venueReview.findMany({
      where: {
        venueId: venueId,
        status: 'APPROVED'
      },
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

    console.log('🔍 VENDOR REVIEWS API: Found reviews:', reviews.length)
    console.log('🔍 VENDOR REVIEWS API: Reviews data:', reviews)

    // Подсчитываем непрочитанные отзывы (все отзывы без ответов)
    const unreadCount = await prisma.venueReview.count({
      where: {
        venueId: venueId,
        status: 'APPROVED',
        replies: {
          none: {}
        }
      }
    })

    console.log('🔍 VENDOR REVIEWS API: Unread count:', unreadCount)

    const result = {
      reviews: reviews.map(review => ({
        ...review,
        isRead: review.replies.length > 0
      })),
      unreadCount
    }

    console.log('🔍 VENDOR REVIEWS API: Final result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching venue reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
