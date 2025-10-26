import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/public/venues/[slug] - получить конкретное место по slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const venue = await prisma.venuePartner.findFirst({
      where: {
        slug: slug,
        status: 'ACTIVE'
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
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: {
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
            reviews: { where: { status: 'APPROVED' } }
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
    const similarVenues = await prisma.venuePartner.findMany({
      where: {
        subcategoryId: venue.subcategoryId,
        cityId: venue.cityId,
        status: 'ACTIVE',
        id: { not: venue.id }
      },
      include: {
        vendor: {
          select: {
            displayName: true,
            logo: true
          }
        },
        subcategory: {
          select: {
            name: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: { where: { status: 'APPROVED' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })

    const enrichedVenue = {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      description: venue.description,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
      tariff: venue.tariff,
      priceFrom: venue.priceFrom,
      priceTo: venue.priceTo,
      ageFrom: venue.ageFrom,
      ageTo: venue.ageTo,
      coverImage: venue.coverImage,
      district: venue.district,
      metro: venue.metro,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      vendor: venue.vendor,
      subcategory: venue.subcategory,
      city: venue.city,
      reviews: venue.reviews,
      stats: {
        reviewsCount: venue._count?.reviews || 0
      },
      similarVenues: similarVenues.map(v => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        description: v.description,
        address: v.address,
        tariff: v.tariff,
        priceFrom: v.priceFrom,
        priceTo: v.priceTo,
        coverImage: v.coverImage,
        vendor: v.vendor,
        subcategory: v.subcategory,
        stats: {
          reviewsCount: v._count?.reviews || 0
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
