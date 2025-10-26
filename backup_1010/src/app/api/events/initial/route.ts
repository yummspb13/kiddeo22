import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    
    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    // Объединяем все критические запросы в один
    const [events, categories, heroSlots, collections] = await Promise.all([
      // Первые 8 событий
      prisma.afishaEvent.findMany({
        where: {
          status: 'active',
          city: city,
          endDate: { gte: new Date() }
        },
        orderBy: [
          { priority: 'asc' },
          { isPromoted: 'desc' },
          { isPopular: 'desc' },
          { viewCount: 'desc' },
          { startDate: 'asc' }
        ],
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          startDate: true,
          endDate: true,
          coverImage: true,
          venue: true,
          isPaid: true,
          minPrice: true,
          category: true
        }
      }),

      // Категории
      prisma.afishaCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),

      // Hero слоты
      prisma.heroSlot.findMany({
        where: {
          city: city,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Коллекции
      prisma.collection.findMany({
        where: {
          isActive: true,
          OR: [
            { cityId: null }, // Глобальные
            { city: { slug: city === 'Москва' ? 'moskva' : 'spb' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          city: true,
          _count: {
            select: { eventCollections: true }
          }
        }
      })
    ])

    // Выбираем случайный hero слот
    const randomSlot = heroSlots.length > 0 
      ? heroSlots[Math.floor(Math.random() * heroSlots.length)]
      : null

    // Получаем события для hero слота
    let heroEvents = []
    if (randomSlot) {
      const eventIds = randomSlot.eventIds as string[]
      heroEvents = await prisma.afishaEvent.findMany({
        where: {
          id: { in: eventIds },
          status: 'active',
          startDate: { gte: new Date() }
        },
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          endDate: true,
          coverImage: true,
          venue: true,
          isPaid: true,
          tickets: true,
          minPrice: true
        }
      })
    }

    return NextResponse.json({
      events,
      categories,
      heroSlot: randomSlot,
      heroEvents,
      collections,
      pagination: {
        hasMore: true,
        nextOffset: 8
      }
    })

  } catch (error) {
    console.error('Error in initial events API:', error)
    return NextResponse.json({ error: 'Failed to fetch initial data' }, { status: 500 })
  }
}
