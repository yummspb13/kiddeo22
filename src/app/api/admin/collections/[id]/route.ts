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

      const collection = await prisma.collection.findUnique({
        where: { id },
        include: {
          eventCollections: {
            include: {
              event: true
            }
          },
          venueCollections: {
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
          },
          _count: {
            select: { 
              eventCollections: true,
              venueCollections: true
            }
          }
        }
      })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
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

    const collection = await prisma.collection.update({
      where: { id },
      data: body,
      include: {
        _count: {
          select: { 
            eventCollections: true,
            venueCollections: true
          }
        }
      }
    })

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 })
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

    // Сначала удаляем связи с событиями через CollectionEvent
    await prisma.collectionEvent.deleteMany({
      where: { collectionId: id }
    })

    // Удаляем связи с местами через CollectionVenue
    await prisma.collectionVenue.deleteMany({
      where: { collectionId: id }
    })

    // Затем удаляем подборку
    await prisma.collection.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}
