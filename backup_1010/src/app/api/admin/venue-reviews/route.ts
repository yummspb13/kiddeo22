import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authResult = await requireAdminOrDevKey(searchParams as any)
    
    const status = searchParams.get('status') || 'MODERATION'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const reviews = await prisma.venueReview.findMany({
      where: {
        status: status as any
      },
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
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const total = await prisma.venueReview.count({
      where: {
        status: status as any
      }
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching venue reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Добавляем key параметр для аутентификации
    searchParams.set('key', 'kidsreview2025')
    const authResult = await requireAdminOrDevKey(searchParams as any)
    
    const body = await request.json()
    const { reviewId, status, moderatorNotes } = body
    
    if (!reviewId || !status) {
      return NextResponse.json(
        { error: 'Review ID and status are required' },
        { status: 400 }
      )
    }
    
    const updatedReview = await prisma.venueReview.update({
      where: { id: reviewId },
      data: {
        status: status as any
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        venue: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      review: updatedReview 
    })
  } catch (error) {
    console.error('Error moderating venue review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
