import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status') || 'APPROVED'

    console.log('🔍 GET /api/simple-reviews - eventId:', eventId, 'status:', status)

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const reviews = await prisma.eventReview.findMany({
      where: {
        eventId: eventId,
        status: status as 'MODERATION' | 'APPROVED' | 'REJECTED' | 'HIDDEN'
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
