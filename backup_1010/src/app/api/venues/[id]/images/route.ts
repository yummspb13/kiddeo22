import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/venues/[id]/images - получить изображения места
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const venueId = id

    if (isNaN(parseInt(venueId))) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 })
    }

    const venue = await prisma.listing.findUnique({
      where: { id: parseInt(venueId) },
      select: { images: true }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    let images: string[] = []
    
    if (venue.images) {
      try {
        images = JSON.parse(venue.images)
      } catch (error) {
        console.error('Error parsing venue images:', error)
      }
    }

    return NextResponse.json({ images })

  } catch (error) {
    console.error('Error fetching venue images:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
