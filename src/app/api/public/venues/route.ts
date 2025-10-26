import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/public/venues - получить список мест для публичного доступа
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citySlug = searchParams.get('city') || searchParams.get('citySlug')
    const categorySlug = searchParams.get('categorySlug')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Ограничиваем максимум 50

    const skip = (page - 1) * limit

    // Строим условия фильтрации для VenuePartner
    const where: any = {
      status: 'ACTIVE'
    }

    // Фильтр по городу
    if (citySlug) {
      where.city = {
        slug: citySlug
      }
    }

    // Фильтр по категории
    if (categorySlug) {
      where.subcategory = {
        category: {
          slug: categorySlug
        }
      }
    }

    // Поиск по названию и описанию
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Оптимизированный запрос с select вместо include
    const [venues, totalCount] = await Promise.all([
      prisma.venuePartner.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          address: true,
          priceFrom: true,
          priceTo: true,
          district: true,
          metro: true,
          coverImage: true,
          additionalImages: true,
          createdAt: true,
          updatedAt: true,
          vendor: {
            select: {
              id: true,
              displayName: true,
              logo: true
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.venuePartner.count({ where })
    ])

    // Преобразуем данные в нужный формат
    const formattedVenues = venues.map(venue => ({
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      description: venue.description,
      address: venue.address,
      priceFrom: venue.priceFrom,
      priceTo: venue.priceTo,
      district: venue.district,
      metro: venue.metro,
      images: venue.coverImage ? [venue.coverImage] : [],
      additionalImages: venue.additionalImages ? (typeof venue.additionalImages === 'string' && venue.additionalImages.startsWith('[') ? JSON.parse(venue.additionalImages) : [venue.additionalImages]) : [],
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      vendor: venue.vendor,
      category: venue.subcategory?.category,
      subcategory: venue.subcategory,
      city: venue.city
    }))

    return NextResponse.json({
      venues: formattedVenues,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching venues:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to fetch venues', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
