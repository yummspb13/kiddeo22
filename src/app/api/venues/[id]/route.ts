import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/venues/[id] - получить конкретное место
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const venueId = id

    if (isNaN(parseInt(venueId))) {
      return NextResponse.json(
        { error: 'Invalid venue ID' },
        { status: 400 }
      )
    }

    const venue = await prisma.listing.findFirst({
      where: {
        id: parseInt(venueId),
        type: { in: ['VENUE', 'SERVICE'] },
        isActive: true
      },
      include: {
        vendor: {
          select: {
            id: true,
            displayName: true,
            description: true,
            logo: true,
            email: true,
            phone: true,
            website: true,
            address: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        Review: {
          where: { isPublic: true },
          include: {
        User_Review_userIdToUser: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            bookings: true,
            Review: { where: { isPublic: true } }
          }
        }
      }
    })

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      )
    }

    // Получаем похожие места
    const similarVenues = await prisma.listing.findMany({
      where: {
        categoryId: venue.categoryId,
        cityId: venue.cityId,
        type: { in: ['VENUE', 'SERVICE'] },
        isActive: true,
        id: { not: parseInt(venueId) }
      },
      include: {
        vendor: {
          select: {
            displayName: true,
            logo: true
          }
        },
        category: {
          select: {
            name: true,
            icon: true,
            color: true
          }
        },
        _count: {
          select: {
            bookings: true,
            Review: { where: { isPublic: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })

    const enrichedVenue = {
      id: venue.id,
      title: venue.title,
      slug: venue.slug,
      description: venue.description,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
      isFree: venue.isFree,
      isIndoor: venue.isIndoor,
      priceFrom: venue.priceFrom,
      priceTo: venue.priceTo,
      ageFrom: venue.ageFrom,
      ageTo: venue.ageTo,
      images: venue.images ? JSON.parse(venue.images) : [],
      district: venue.district,
      bookingMode: venue.bookingMode,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      vendor: venue.vendorId,
      category: venue.categoryId,
      city: venue.cityId,
      reviews: [],
      stats: {
        bookingsCount: (venue as any)._count?.bookings || 0,
        reviewsCount: (venue as any)._count?.Review || 0
      },
      similarVenues: similarVenues.map(v => ({
        id: v.id,
        title: v.title,
        slug: v.slug,
        description: v.description,
        address: v.address,
        isFree: v.isFree,
        priceFrom: v.priceFrom,
        priceTo: v.priceTo,
        images: v.images ? JSON.parse(v.images) : [],
        vendor: v.vendorId,
        category: v.categoryId,
        stats: {
          bookingsCount: v._count?.bookings || 0,
          reviewsCount: v._count?.Review || 0
        }
      }))
    }

    return NextResponse.json(enrichedVenue)

  } catch (error) {
    console.error('Error fetching venue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venue' },
      { status: 500 }
    )
  }
}

