import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/venues - получить список мест
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')
    const search = searchParams.get('search')
    const isFree = searchParams.get('isFree')
    const isIndoor = searchParams.get('isIndoor')
    const priceFrom = searchParams.get('priceFrom')
    const priceTo = searchParams.get('priceTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Строим условия фильтрации
    const where: unknown = {
      type: { in: ['VENUE', 'SERVICE'] },
      isActive: true
    }

    if (cityId) (where as any).cityId = parseInt(cityId)
    if (categoryId) (where as any).categoryId = parseInt(categoryId)
    if (isFree !== null) (where as any).isFree = isFree === 'true'
    if (isIndoor !== null) (where as any).isIndoor = isIndoor === 'true'
    if (priceFrom) (where as any).priceFrom = { gte: parseInt(priceFrom) }
    if (priceTo) (where as any).priceTo = { lte: parseInt(priceTo) }

    // Поиск по названию и описанию
    if (search) {
      (where as any).OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Оптимизируем запрос, сохраняя всю бизнес-логику
    const [venues, totalCount] = await Promise.all([
      prisma.venuePartner.findMany({
        where: {
          status: 'ACTIVE',
          ...(cityId && { cityId: parseInt(cityId) }),
          ...(subcategoryId && { subcategoryId: parseInt(subcategoryId) }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          })
        },
        include: {
          vendor: {
            select: {
              id: true,
              displayName: true,
              logo: true,
              email: true,
              phone: true,
              website: true
            }
          },
          subcategory: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                  color: true
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
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: Math.min(limit, 50) // Увеличиваем лимит, но ограничиваем
      }),
      prisma.venuePartner.count({ 
        where: {
          status: 'ACTIVE',
          ...(cityId && { cityId: parseInt(cityId) }),
          ...(subcategoryId && { subcategoryId: parseInt(subcategoryId) }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          })
        }
      })
    ])

    // Обогащаем данные
    const enrichedVenues = venues.map(venue => ({
      id: venue.id,
      title: venue.name,
      slug: venue.slug,
      description: venue.description,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
      isFree: venue.tariff === 'FREE',
      isIndoor: true, // По умолчанию для VenuePartner
      tariff: venue.tariff,
      priceFrom: venue.priceFrom,
      priceTo: venue.priceTo,
      ageFrom: venue.ageFrom,
      ageTo: venue.ageTo,
      images: venue.additionalImages ? JSON.parse(venue.additionalImages) : [],
      district: venue.district,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      vendor: venue.vendor,
      category: venue.subcategory?.category,
      subcategory: venue.subcategory,
      city: venue.city,
      tariff: venue.tariff,
      stats: {
        bookingsCount: 0, // Пока нет в VenuePartner
        reviewsCount: venue._count?.reviews || 0
      }
    }))

    return NextResponse.json({
      venues: enrichedVenues,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}

