import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const venues = await prisma.collectionVenue.findMany({
      where: { collectionId: id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            priceFrom: true,
            priceTo: true,
            coverImage: true,
            additionalImages: true,
            status: true,
            subcategory: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(venues)
  } catch (error) {
    console.error('Error fetching collection venues:', error)
    return NextResponse.json({ error: 'Failed to fetch collection venues' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { venueId, order = 0 } = body

    // Проверяем, что место существует и активно
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId },
      select: { id: true, status: true }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    if (venue.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Venue is not active' }, { status: 400 })
    }

    // Проверяем, что место еще не добавлено в подборку
    const existingVenue = await prisma.collectionVenue.findUnique({
      where: {
        collectionId_venueId: {
          collectionId: id,
          venueId: venueId
        }
      }
    })

    if (existingVenue) {
      return NextResponse.json({ error: 'Venue already in collection' }, { status: 400 })
    }

    const collectionVenue = await prisma.collectionVenue.create({
      data: {
        collectionId: id,
        venueId: venueId,
        order: order
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            priceFrom: true,
            priceTo: true,
            coverImage: true,
            additionalImages: true,
            status: true,
            subcategory: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(collectionVenue)
  } catch (error) {
    console.error('Error adding venue to collection:', error)
    return NextResponse.json({ error: 'Failed to add venue to collection' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams: urlSearchParams } = new URL(request.url)
    const venueId = urlSearchParams.get('venueId')

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    await prisma.collectionVenue.deleteMany({
      where: {
        collectionId: id,
        venueId: parseInt(venueId)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing venue from collection:', error)
    return NextResponse.json({ error: 'Failed to remove venue from collection' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { venueId, order } = body

    if (order === undefined) {
      return NextResponse.json({ error: 'Order is required' }, { status: 400 })
    }

    const collectionVenue = await prisma.collectionVenue.updateMany({
      where: {
        collectionId: id,
        venueId: venueId
      },
      data: {
        order: order
      }
    })

    return NextResponse.json({ success: true, updated: collectionVenue.count })
  } catch (error) {
    console.error('Error updating venue order:', error)
    return NextResponse.json({ error: 'Failed to update venue order' }, { status: 500 })
  }
}
