import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getMinActivePrice } from '@/lib/price'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Маппинг для совместимости: moscow -> moskva
    const mappedSlug = slug === 'moscow' ? 'moskva' : slug
    
    // Получаем подборку по slug
    const collection = await prisma.collection.findUnique({
      where: { slug: mappedSlug },
      include: {
        eventCollections: {
          include: {
            event: {
              include: {
                category: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: [
            { event: { startDate: 'asc' } },
            { event: { createdAt: 'desc' } }
          ]
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
                status: true,
                tariff: true,
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
        }
      }
    })
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    
    if (!collection.isActive) {
      return NextResponse.json({ error: 'Collection is not active' }, { status: 404 })
    }
    
    // Вычисляем минимальную цену для каждого события
    const eventsWithPrice = collection.eventCollections.map(ec => {
      const event = ec.event
      const minPrice = getMinActivePrice(event.tickets, event.isPaid)
      
      return {
        ...ec,
        event: {
          ...event,
          minPrice: minPrice
        }
      }
    })
    
    // Получаем рейтинги для всех мест
    const venueIds = collection.venueCollections.map(vc => vc.venue.id)
    const venueRatings = await prisma.venueReview.groupBy({
      by: ['venueId'],
      where: {
        venueId: { in: venueIds },
        status: 'APPROVED'
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    })

    // Создаем мапу рейтингов для быстрого поиска
    const ratingsMap = new Map()
    venueRatings.forEach(rating => {
      ratingsMap.set(rating.venueId, {
        averageRating: rating._avg.rating ? Number(rating._avg.rating.toFixed(1)) : 0,
        reviewsCount: rating._count.id
      })
    })

    // Фильтруем только активные события и места, добавляем рейтинги
    const filteredCollection = {
      ...collection,
      eventCollections: eventsWithPrice.filter(ec => ec.event.status === 'active'),
      venueCollections: collection.venueCollections
        .filter(vc => vc.venue.status === 'ACTIVE')
        .map(vc => ({
          ...vc,
          venue: {
            ...vc.venue,
            averageRating: ratingsMap.get(vc.venue.id)?.averageRating || 0,
            reviewsCount: ratingsMap.get(vc.venue.id)?.reviewsCount || 0
          }
        }))
    }
    
    return NextResponse.json(filteredCollection)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
