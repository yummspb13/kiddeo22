import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    console.log('Collections API: Starting request')
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') ? decodeURIComponent(searchParams.get('city')!) : null
    const citySlug = searchParams.get('citySlug') ? decodeURIComponent(searchParams.get('citySlug')!) : null
    const section = searchParams.get('section') // venues, afisha, main, blog
    
    console.log('Collections API: Params', { city, citySlug, section })
    
    // Строим условие для фильтрации по городу
    const whereClause: any = {
      isActive: true
    }
    
    // Фильтрация по секции
    if (section === 'venues') {
      whereClause.showInVenues = true
    } else if (section === 'afisha') {
      whereClause.hideFromAfisha = false
    } else if (section === 'main') {
      whereClause.showInMain = true
    } else if (section === 'blog') {
      whereClause.showInBlog = true
    } else {
      // По умолчанию показываем в афише
      whereClause.hideFromAfisha = false
    }
    
    if (city) {
      whereClause.city = city
    } else if (citySlug) {
      whereClause.citySlug = citySlug
    }
    
    console.log('Collections API: Where clause', whereClause)
    
    // Оптимизируем запрос, сохраняя всю бизнес-логику
    const queryStartTime = Date.now()
    console.log('Collections API: Starting database query')
    const collections = await prisma.collection.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        eventCollections: {
          where: {
            event: { status: 'active' }
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                startDate: true,
                endDate: true,
                coverImage: true,
                minPrice: true,
                ageFrom: true,
                ageTo: true,
                city: true,
                venue: true
              }
            }
          }
        },
        venueCollections: {
          where: {
            venue: { status: 'ACTIVE' }
          },
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                address: true,
                coverImage: true,
                priceFrom: true,
                priceTo: true,
                ageFrom: true,
                ageTo: true,
                subcategory: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            eventCollections: {
              where: {
                event: { status: 'active' }
              }
            },
            venueCollections: {
              where: {
                venue: { status: 'ACTIVE' }
              }
            }
          }
        }
      },
      take: 20 // Увеличиваем лимит, но ограничиваем
    })
    
    const queryEndTime = Date.now()
    const totalTime = Date.now() - startTime
    console.log(`Collections API: Database query completed in ${queryEndTime - queryStartTime}ms`)
    console.log(`Collections API: Found ${collections.length} collections`)
    console.log(`Collections API: Total time: ${totalTime}ms`)
    console.log(`Collections API: Returning ${collections.length} collections`)
    
    // Упрощаем данные для уменьшения размера ответа
    const simplifiedCollections = collections.map(collection => ({
      id: collection.id,
      title: collection.title,
      slug: collection.slug,
      description: collection.description,
      coverImage: collection.coverImage,
      isActive: collection.isActive,
      hideFromAfisha: collection.hideFromAfisha,
      showInVenues: collection.showInVenues,
      showInMain: collection.showInMain,
      showInBlog: collection.showInBlog,
      order: collection.order,
      city: collection.city,
      citySlug: collection.citySlug,
      eventsTitle: collection.eventsTitle,
      eventsDescription: collection.eventsDescription,
      venuesTitle: collection.venuesTitle,
      venuesDescription: collection.venuesDescription,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      eventCollections: collection.eventCollections.map(ec => ({
        id: ec.id,
        event: ec.event
      })),
      venueCollections: collection.venueCollections.map(vc => ({
        id: vc.id,
        order: vc.order,
        venue: vc.venue
      })),
      _count: collection._count
    }))

    // Возвращаем данные через стандартный Response API для избежания chunked encoding
    const jsonString = JSON.stringify(simplifiedCollections)
    
    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': String(Buffer.byteLength(jsonString, 'utf8')),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
